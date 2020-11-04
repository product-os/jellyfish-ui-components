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
} from '../../../../test/ui-setup'

import UpdateContext from './'
import Icon from '../../../shame/Icon'

const {
	wrapper
} = getWrapper()

const TIMESTAMP_DATE = moment()

const ACTOR = {
	name: 'fake-actor'
}

const CARD = {
	name: 'fake card name',
	data: {
		timestamp: TIMESTAMP_DATE.toString()
	}
}

ava('Renders a pencil icon', async (test) => {
	const header = shallow(<UpdateContext card={CARD} actor={ACTOR} />)
	const icon = header.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'pencil-alt'
	})
})

ava('Renders a message with the actor name and when they made the update', async (test) => {
	const header = mount(<UpdateContext card={CARD} actor={ACTOR}/>, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${TIMESTAMP_DATE.format('HH:mm')}`)
})

ava('If actor is not present, renders a message with when the update was made', async (test) => {
	const header = mount(<UpdateContext card={CARD} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), ` updated this at ${TIMESTAMP_DATE.format('HH:mm')}`)
})

ava('If there is no timestamp on the card, the created_at field is used instead', async (test) => {
	const createdAtDate = moment()

	const card = {
		created_at: createdAtDate.toString()
	}

	const header = mount(<UpdateContext actor={ACTOR} card={card} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} updated this at ${createdAtDate.format('HH:mm')}`)
})
