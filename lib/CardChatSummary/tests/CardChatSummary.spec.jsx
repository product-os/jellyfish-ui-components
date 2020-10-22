/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	flushPromises,
	getWrapper
} from '../../../test/ui-setup'
import _ from 'lodash'
import ava from 'ava'
import {
	shallow,
	mount
} from 'enzyme'
import React from 'react'
import sinon from 'sinon'
import {
	CardChatSummary
} from '..'
import theme from './fixtures/theme.json'
import card from './fixtures/card.json'
import inlineImageMsg from './fixtures/msg-inline-image.json'
import user1 from './fixtures/user1.json'
import user2 from './fixtures/user2.json'

const sandbox = sinon.createSandbox()

const getActor = async (id) => {
	if (id === user1.id) {
		return user1
	}

	return user2
}

const getTimeline = (target) => {
	return _.sortBy(_.get(target.links, [ 'has attached element' ], []), 'data.timestamp')
}

const wrappingComponent = getWrapper().wrapper

ava.beforeEach((test) => {
	const getActorSpy = sandbox.spy(getActor)
	test.context = {
		...test.context,
		commonProps: {
			active: true,
			getCard: sandbox.stub(),
			selectCard: sandbox.stub().returns(() => {
				return user2
			}),
			card,
			theme,
			timeline: getTimeline(card),
			getActor: getActorSpy
		}
	}
})

ava.afterEach(() => {
	sandbox.restore()
})

ava('It should render', (test) => {
	const {
		commonProps
	} = test.context

	test.notThrows(() => {
		shallow(<CardChatSummary {...commonProps} />)
	})
})

ava('It should change the actor after an update', async (test) => {
	const {
		commonProps
	} = test.context

	const component = shallow(<CardChatSummary {...commonProps} />)

	// Check if getActor is used
	test.is(commonProps.getActor.callCount, 1)

	const newWhisper = {
		id: 'acbfc1ec-bf55-44aa-9361-910f52df3c05',
		data: {
			actor: '713a47bb-74f4-4506-ada7-e5b4060b8b6a',
			target: 'd967c40b-7495-4132-b2ff-16d16259d783',
			payload: {
				message: 'x',
				alertsUser: [],
				mentionsUser: [],
				alertsGroup: [],
				mentionsGroup: []
			},
			timestamp: '2019-05-31T13:45:00.300Z'
		},
		name: null,
		slug: 'whisper-c643e8ee-df73-4592-b9d3-7c6e4f5ca72e',
		tags: [],
		type: 'whisper@1.0.0',
		links: {},
		active: true,
		markers: [],
		version: '1.0.0',
		requires: [],
		linked_at: {
			'is attached to': '2019-05-31T13:45:00.783Z'
		},
		created_at: '2019-05-31T13:45:00.548Z',
		updated_at: null,
		capabilities: []
	}

	// Add the new whisper to the current
	// timeline and sort it by timestamp
	component.setProps({
		timeline: _.sortBy([ ...commonProps.timeline, newWhisper ], 'data.timestamp')
	})

	component.update()
	await flushPromises()

	test.is(component.state('actor').id, newWhisper.data.actor)
})

ava('Inline messages are transformed to a text representation', async (test) => {
	const {
		commonProps
	} = test.context

	const component = await mount((
		<CardChatSummary
			{...commonProps}
			timeline={[ inlineImageMsg ]}
		/>
	), {
		wrappingComponent
	})
	const messageSummary = component.find('div[data-test="card-chat-summary__message"]')
	const messageSummaryText = messageSummary.text()
	test.is(messageSummaryText.trim(), '[some-image.png]')
})

ava('Links are transformed to use the RouterLink component', async (test) => {
	const {
		commonProps
	} = test.context

	const component = await mount((
		<CardChatSummary
			{...commonProps}
			timeline={[ inlineImageMsg ]}
		/>
	), {
		wrappingComponent
	})
	const messageSummary = component.find('div[data-test="card-chat-summary__message"]')

	const link = messageSummary.find('Link')
	test.is(link.props().href, 'https://via.placeholder.com/150')
})
