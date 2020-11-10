/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import React from 'react'
import moment from 'moment'
import {
	mount,
	shallow
} from 'enzyme'
import {
	getWrapper
} from '../../../test/ui-setup'

import Context from './Context'
import Icon from '../../shame/Icon'

const {
	wrapper
} = getWrapper()

const TIMESTAMP_DATE = moment()

const ACTOR = {
	name: 'fake-actor'
}

const CARD = {
	data: {
		timestamp: TIMESTAMP_DATE.toString()
	}
}

ava('Renders a pencil icon if the card has no name', async (test) => {
	const header = shallow(<Context card={CARD} actor={ACTOR} />)
	const icon = header.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'pencil-alt'
	})
})

ava('Renders a lightbulb icon if the card has a name', (test) => {
	const card = {
		...CARD,
		name: 'Reopen due to activity'
	}
	const header = shallow(<Context card={card} actor={ACTOR} />)
	const icon = header.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'lightbulb'
	})
})

ava('If the card has no name, Context renders a message ' +
' with the actor name and when they made the update', async (test) => {
	const header = mount(<Context card={CARD} actor={ACTOR}/>, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${TIMESTAMP_DATE.format('HH:mm')}`)
})

ava('If the card has no name and the actor is not present, ' +
'Context renders a message with when the update was made', async (test) => {
	const header = mount(<Context card={CARD} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `updated this at ${TIMESTAMP_DATE.format('HH:mm')}`)
})

ava('If the card has a name, Context uses the name to render' +
' a message including the reason for the update', (test) => {
	const card = {
		...CARD,
		name: 'Support Thread reopened due to activity'
	}
	const header = mount(<Context card={card} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `Support Thread reopened due to activity at ${TIMESTAMP_DATE.format('HH:mm')}`)
})

ava('If there is no timestamp on the card, the created_at field is used instead', async (test) => {
	const createdAtDate = moment()

	const card = {
		created_at: createdAtDate.toString()
	}

	const header = mount(<Context actor={ACTOR} card={card} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${createdAtDate.format('HH:mm')}`)
})
