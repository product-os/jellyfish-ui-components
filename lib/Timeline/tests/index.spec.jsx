/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'
import _ from 'lodash'
import React from 'react'
import {
	mount
} from 'enzyme'
import {
	createTestContext,
	wrapperWithSetup
} from './helpers'
import Timeline from '../'

const sandbox = sinon.createSandbox()

ava.before((test) => {
	test.context = createTestContext(test, sandbox)
})

ava.afterEach(() => {
	sandbox.restore()
})

ava('The TimelineStart component is rendered' +
	' when all the events in the timeline have been returned and rendered', async (test) => {
	const {
		eventProps
	} = test.context

	const timeline = await mount(
		<Timeline
			{...eventProps}
			tail={[]}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: eventProps.sdk
			}
		})

	const timelineStart = timeline.find('div[data-test="Timeline__TimelineStart"]')
	test.is(timelineStart.text(), 'Beginning of Timeline')
})

ava('Events are toggled when the event in the url is one of type UPDATE', async (test) => {
	const {
		eventProps
	} = test.context

	test.timeout(25001)

	const eventId = 'fake-update-id'

	// eslint-disable-next-line prefer-reflect
	delete window.location

	global.window.location = {
		search: `?event=${eventId}`
	}

	const wrapper = await mount(
		<Timeline
			{...eventProps}
			tail={[ {
				id: eventId,
				type: 'update@1.0.0',
				data: {
					payload: []
				}
			} ]}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: eventProps.sdk
			}
		})
	await Bluebird.delay(2500)

	const timeline = wrapper.childAt(0)

	test.false(timeline.state('messagesOnly'))
})

ava('Events are toggled when the event in the url is one of type CREATE', async (test) => {
	const {
		eventProps
	} = test.context

	test.timeout(25001)
	const eventId = 'fake-create-id'

	// eslint-disable-next-line prefer-reflect
	delete window.location

	global.window.location = {
		search: `?event=${eventId}`
	}

	const wrapper = await mount(
		<Timeline
			{...eventProps}
			tail={[ {
				id: eventId,
				type: 'create@1,0,0'
			} ]}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: eventProps.sdk
			}
		})

	await Bluebird.delay(2500)
	const timeline = wrapper.childAt(0)

	test.false(timeline.state('messagesOnly'))
})

ava('A message is not removed from the pendingMessage list until it has been added to the tail', async (test) => {
	const {
		eventProps
	} = test.context

	const createMessage = sandbox.stub()
	createMessage.resolves()

	const wrapper = await mount(
		<Timeline
			{...eventProps}
			setTimelineMessage={_.noop}
			tail={[]}
			sdk={{
				event: {
					create: createMessage
				}
			}
			}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: eventProps.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)
		.instance()

	await timeline.addMessage('Here is a new message', false)

	const pendingMessages = timeline.state.pendingMessages
	test.is(pendingMessages.length, 1)

	// Simulate the stream returning the pending message as part of the tail
	wrapper.setProps({
		tail: [ pendingMessages[0] ]
	})

	const updatedPendingMessages = timeline.state.pendingMessages
	test.is(updatedPendingMessages.length, 0)
})
