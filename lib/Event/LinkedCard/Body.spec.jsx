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
import '../../../test/ui-setup'
import {
	Txt
} from 'rendition'

import Body from './Body'
import Icon from '../../shame/Icon'
import Link from '../../Link'

const CARD = {
	id: 'fake_id'
}

ava('An arrow icon is rendered by the Body component', async (test) => {
	const content = shallow(<Body card={CARD} />)
	const icon = content.find(Icon)
	test.deepEqual(icon.props(), {
		name: 'level-up-alt',
		rotate: '90'
	})
})

ava('Renders a link to the Linked card', async (test) => {
	const content = shallow(<Body card={CARD} />)
	const link = content.find(Link)
	const props = link.props()
	test.is(props.to, `https://jel.ly.fish/${CARD.id}`)
})

ava('Renders the name of the linked card when its present', async (test) => {
	const card = {
		id: 'fake-id',
		slug: 'fake-slug',
		name: 'fake-name'
	}
	const content = shallow(<Body card={card} />)
	const txt = content.find(Txt)
	test.is(txt.text(), card.name)
})

ava('Renders the slug of the linked card when the name is not present', async (test) => {
	const card = {
		id: 'fake-id',
		slug: 'fake-slug'
	}
	const content = shallow(<Body card={card} />)
	const txt = content.find(Txt)
	test.is(txt.text(), card.slug)
})

ava('Renders the id of the linked card when the name and the slug aren\'t present', async (test) => {
	const content = shallow(<Body card={CARD} />)
	const txt = content.find(Txt)
	test.is(txt.text(), CARD.id)
})
