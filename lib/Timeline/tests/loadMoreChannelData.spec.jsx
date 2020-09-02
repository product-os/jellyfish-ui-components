/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import Bluebird from 'bluebird'
import _ from 'lodash'
import React from 'react'
import sinon from 'sinon'
import {
	mount
} from 'enzyme'
import {
	createTestContext,
	wrapperWithSetup
} from './helpers'
import Timeline from '../'
import {
	InfiniteList
} from '../../InfiniteList'

const sandbox = sinon.createSandbox()

// This simulates a situation where we have a scrollHeight
// larger than the client (e.g. there are more events than can be
// viewed in the timeline and they overflow to a scrollable
// container
const simulateOverflow = () => {
	Reflect.defineProperty(window.Element.prototype, 'clientHeight', {
		configurable: true, value: 500
	})
	Reflect.defineProperty(window.Element.prototype, 'scrollHeight', {
		configurable: true, value: 700
	})
}

// ScrollHeight and clientHeight are always 0 in enzyme
const removeOverflowSimulation = () => {
	Reflect.defineProperty(window.Element.prototype, 'clientHeight', {
		configurable: true,
		value: 0
	})
	Reflect.defineProperty(window.Element.prototype, 'scrollHeight', {
		configurable: true,
		value: 0
	})
}

const addEventToLocation = (eventId) => {
	Reflect.deleteProperty(window, 'location')
	window.location = Object.create(window)
	window.location.search = `?event=${eventId}`
}

const removeEventFromLocation = () => {
	Reflect.deleteProperty(window.location, 'search')
}

ava.beforeEach((test) => {
	test.context = createTestContext(test, sandbox)
})

ava.afterEach(() => {
	sandbox.restore()
	removeOverflowSimulation()
	removeEventFromLocation()
})

ava('loadMoreChannelData is not called until the timeline is ready', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)

	test.false(timeline.state('ready'))

	test.is(loadMoreChannelData.callCount, 0)

	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false
	})

	test.is(loadMoreChannelData.callCount, 1)
})

ava('loadMoreChannelData is not called if we have reached the start of the timeline', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true
	})

	// Timeline component assumes we have reached the beginning
	// of the timeline if the tail length is less than
	// the page size so this should already be set to true
	test.true(timeline.state('reachedBeginningOfTimeline'))

	test.is(loadMoreChannelData.callCount, 0)

	timeline.setState({
		reachedBeginningOfTimeline: false
	})

	test.is(loadMoreChannelData.callCount, 1)
})

ava('loadMoreChannelData is called if the timeline has not overflowed', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false
	})

	test.is(loadMoreChannelData.callCount, 1)
})

ava('loadMoreChannelData is not called when we have enough cards ' +
'for the timeline to overflow and generate a scroll bar', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	simulateOverflow()

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false
	})

	const infiniteList = wrapper.find(InfiniteList).getDOMNode()
	test.is(infiniteList.scrollHeight, 700)
	test.is(infiniteList.clientHeight, 500)

	test.is(loadMoreChannelData.callCount, 0)
})

ava('loadMoreChannelData is called when the user reaches the top of the scroll', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	simulateOverflow()

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false
	})

	const infiniteList = wrapper.find(InfiniteList)

	const	infiniteListElement = infiniteList.getDOMNode()
	test.is(infiniteListElement.scrollHeight, 700)
	test.is(infiniteListElement.clientHeight, 500)

	test.is(loadMoreChannelData.callCount, 0)

	infiniteList.simulate('scroll')

	test.is(infiniteListElement.scrollTop, 0)
	test.is(loadMoreChannelData.callCount, 1)
})

ava('loadMoreChannelData is called when there is an event in the url ' +
'and the user reaches the top of the scroll', async (test) => {
	const {
		eventProps: {
			loadMoreChannelData,
			...rest
		}
	} = test.context

	const eventId = 'fake-event-id'

	simulateOverflow()
	addEventToLocation(eventId)

	const wrapper = await mount(
		<Timeline
			{...rest}
			tail={[ {
				id: 'fake-event-id',
				type: 'message@1.0.0'
			} ]}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})

	const timeline = wrapper
		.childAt(0)
	test.false(timeline.state('ready'))

	// Unfortunate delay required to ensure ready is set correctly
	await Bluebird.delay(2500)
	test.true(timeline.state('ready'))

	const infiniteList = wrapper.find(InfiniteList)

	const infiniteListElement = infiniteList.getDOMNode()
	test.is(infiniteListElement.scrollHeight, 700)
	test.is(infiniteListElement.clientHeight, 500)

	test.is(loadMoreChannelData.callCount, 0)

	infiniteList.simulate('scroll')

	test.is(infiniteListElement.scrollTop, 0)
	test.is(loadMoreChannelData.callCount, 1)
})

ava('loadMoreChannelData is used to get all the events for the timeline when' +
	'the event in the url is not present in our first page of results', async (test) => {
	const {
		eventProps: {
			card,
			...rest
		}
	} = test.context

	test.timeout(25001)
	const eventId = 'fake-message-id'

	// eslint-disable-next-line prefer-reflect
	delete window.location

	global.window.location = {
		search: `?event=${eventId}`
	}

	const tail = _.times(20, (index) => {
		return {
			id: `fake-event-${index}`,
			type: 'message@1.0.0',
			data: {
				target: 'fake-target-id'
			}
		}
	})

	const loadMoreChannelData = sandbox.stub()
	loadMoreChannelData.resolves([ {
		id: eventId,
		type: 'message@1.0.0',
		data: {
			target: {
				id: 'fake-target-id'
			}
		}
	} ])

	await mount(
		<Timeline
			{...rest}
			card={card}
			tail={tail}
			loadMoreChannelData={loadMoreChannelData}
		/>, {
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk
			}
		})
	await Bluebird.delay(2500)

	test.is(loadMoreChannelData.callCount, 1)
	test.deepEqual(loadMoreChannelData.args, [ [ {
		target: card.slug,
		query: {
			type: 'object',
			properties: {
				id: {
					const: card.id
				}
			},
			$$links: {
				'has attached element': {
					type: 'object'
				}
			}
		},
		queryOptions: {
			links: {
				'has attached element': {
					sortBy: 'created_at',
					sortDir: 'desc'
				}
			}
		}
	} ] ])
})
