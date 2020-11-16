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
} from '../../../test/ui-setup'

import Context from './Context'
import Icon from '../../shame/Icon'

const {
	wrapper
} = getWrapper()

const TIMESTAMP_DATE = new Date()

const ACTOR = {
	name: 'fake-actor'
}

const CARD = {
	created_at: TIMESTAMP_DATE.toString()
}

const LINKED_CARD = {
	type: 'user@1.0.0'
}

ava('Renders a link icon', async (test) => {
	const header = shallow(<Context card={CARD} actor={ACTOR} linkedCardInfo={LINKED_CARD} />)
	const icon = header.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'link'
	})
})

ava('Renders a message about the link (who made the link, what card type it is, and when it was linked)', async (test) => {
	const createdAtDate = new Date()

	const card = {
		created_at: createdAtDate.toString()
	}

	const header = mount(<Context actor={ACTOR} card={card} linkedCardInfo={LINKED_CARD} />, {
		wrappingComponent: wrapper
	})
	test.is(header.text(), `${ACTOR.name} added link to User at ${format(createdAtDate, 'HH:mm')}`)
})
