/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import React from 'react'
import format from 'date-fns/format'
import {
	mount,
	shallow
} from 'enzyme'
import {
	getWrapper
} from '../../../../test/ui-setup'

import UpdateContext from './'
import Icon from '../../../shame/Icon'

const {
	wrapper
} = getWrapper()

const TIMESTAMP_DATE = new Date()

const ACTOR = {
	name: 'fake-actor'
}

const CARD = {
	data: {
		timestamp: TIMESTAMP_DATE.toISOString()
	}
}

ava('Renders a pencil icon if the card has no name', async (test) => {
	const header = shallow(<UpdateContext card={CARD} actor={ACTOR} />)
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
	const header = shallow(<UpdateContext card={card} actor={ACTOR} />)
	const icon = header.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'lightbulb'
	})
})

ava('If the card has no name, UpdateContext renders a message ' +
' with the actor name and when they made the update', async (test) => {
	const header = mount(<UpdateContext card={CARD} actor={ACTOR}/>, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${format(TIMESTAMP_DATE, 'HH:mm')}`)
})

ava('If the card has no name and the actor is not present, ' +
'UpdateContext renders a message with when the update was made', async (test) => {
	const header = mount(<UpdateContext card={CARD} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), ` updated this at ${format(TIMESTAMP_DATE, 'HH:mm')}`)
})

ava('If the card has a name, UpdateContext uses the name to render' +
' a message including the reason for the update', (test) => {
	const card = {
		...CARD,
		name: 'Support Thread reopened due to activity'
	}
	const header = mount(<UpdateContext card={card} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `Support Thread reopened due to activity at ${format(TIMESTAMP_DATE, 'HH:mm')}`)
})

ava('If there is no timestamp on the card, the created_at field is used instead', async (test) => {
	const createdAtDate = new Date()

	const card = {
		created_at: createdAtDate.toISOString()
	}

	const header = mount(<UpdateContext actor={ACTOR} card={card} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${format(createdAtDate, 'HH:mm')}`)
})
