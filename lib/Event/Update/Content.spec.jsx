/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import React from 'react'
import {
	shallow
} from 'enzyme'
import '../../test/ui-setup'
import {
	Txt
} from 'rendition'

import Content from './Content'
import Icon from '../shame/Icon'

const CARD = {
	data: {
		payload: [ {
			op: 'add',
			path: '/data/participants',
			value: [ 'fake participant 1', 'fake participant 2' ]
		} ]
	}
}

ava('An arrow icon is rendered by the Content component', async (test) => {
	const content = shallow(<Content card={CARD} />)
	const icon = content.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'level-up-alt',
		rotate: '90'
	})
})

ava('Nothing is rendered if the name is present on the card', async (test) => {
	const cardWithName = {
		name: 'reason for update'
	}
	const content = shallow(<Content card={cardWithName} />)
	test.true(content.isEmptyRender())
})

ava('A description of the operations is rendered when the name is not present on the card', async (test) => {
	const content = shallow(<Content card={CARD} />)
	const txt = content.find(Txt)
	test.is(txt.text(), 'added value to path "/data/participants"')
})

ava('A description of multiple operations is rendered as a list with an \'and\'' +
' between the last two operations', async (test) => {
	const card = {
		data: {
			payload: [ {
				op: 'add',
				path: '/data/participants',
				value: [ 'fake participant 1', 'fake participant 2' ]
			}, {
				op: 'replace',
				path: '/data/owner',
				value: 'fake-owner'
			}, {
				op: 'remove',
				path: '/data/mirrors'
			} ]
		}
	}
	const content = shallow(<Content card={card} />)
	const txt = content.find(Txt)
	test.is(txt.text(), 'added value to path "/data/participants", changed ' +
		'value at path "/data/owner" and removed path "/data/mirrors"')
})
