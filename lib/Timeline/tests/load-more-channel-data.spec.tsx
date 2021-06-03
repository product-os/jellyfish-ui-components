/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import Bluebird from 'bluebird';
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { createTestContext, wrapperWithSetup } from './helpers';
import Timeline from '../';
import { InfiniteList } from '../../InfiniteList';

const sandbox = sinon.createSandbox();

// This simulates a situation where we have a scrollHeight
// larger than the client (e.g. there are more events than can be
// viewed in the timeline and they overflow to a scrollable
// container
const simulateOverflow = () => {
	Reflect.defineProperty(window.Element.prototype, 'clientHeight', {
		configurable: true,
		value: 500,
	});
	Reflect.defineProperty(window.Element.prototype, 'scrollHeight', {
		configurable: true,
		value: 700,
	});
};

// ScrollHeight and clientHeight are always 0 in enzyme
const removeOverflowSimulation = () => {
	Reflect.defineProperty(window.Element.prototype, 'clientHeight', {
		configurable: true,
		value: 0,
	});
	Reflect.defineProperty(window.Element.prototype, 'scrollHeight', {
		configurable: true,
		value: 0,
	});
};

const addEventToLocation = (eventId: any) => {
	Reflect.deleteProperty(window, 'location');
	window.location = Object.create(window);
	window.location.search = `?event=${eventId}`;
};

const removeEventFromLocation = () => {
	Reflect.deleteProperty(window.location, 'search');
};

let context: any = {};

beforeEach(() => {
	context = createTestContext(test, sandbox);
});

afterEach(() => {
	sandbox.restore();
	removeOverflowSimulation();
	removeEventFromLocation();
});

test('loadMoreChannelData is not called until the timeline is ready', async () => {
	const {
		eventProps: { loadMoreChannelData, ...rest },
	} = context;

	const wrapper = await mount(
		<Timeline {...rest} tail={[]} loadMoreChannelData={loadMoreChannelData} />,
		{
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk,
			},
		},
	);

	const timeline = wrapper.childAt(0);

	expect(timeline.state('ready')).toBe(false);

	expect(loadMoreChannelData.callCount).toBe(0);

	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false,
	});

	expect(loadMoreChannelData.callCount).toBe(1);
});

test('loadMoreChannelData is not called if we have reached the start of the timeline', async () => {
	const {
		eventProps: { loadMoreChannelData, ...rest },
	} = context;

	const wrapper = await mount(
		<Timeline {...rest} tail={[]} loadMoreChannelData={loadMoreChannelData} />,
		{
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk,
			},
		},
	);

	const timeline = wrapper.childAt(0);

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
	});

	// Timeline component assumes we have reached the beginning
	// of the timeline if the tail length is less than
	// the page size so this should already be set to true
	expect(timeline.state('reachedBeginningOfTimeline')).toBe(true);

	expect(loadMoreChannelData.callCount).toBe(0);

	timeline.setState({
		reachedBeginningOfTimeline: false,
	});

	expect(loadMoreChannelData.callCount).toBe(1);
});

test('loadMoreChannelData is called if the timeline has not overflowed', async () => {
	const {
		eventProps: { loadMoreChannelData, ...rest },
	} = context;

	const wrapper = await mount(
		<Timeline {...rest} tail={[]} loadMoreChannelData={loadMoreChannelData} />,
		{
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk,
			},
		},
	);

	const timeline = wrapper.childAt(0);

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false,
	});

	expect(loadMoreChannelData.callCount).toBe(1);
});

test(
	'loadMoreChannelData is not called when we have enough cards ' +
		'for the timeline to overflow and generate a scroll bar',
	async () => {
		const {
			eventProps: { loadMoreChannelData, ...rest },
		} = context;

		simulateOverflow();

		const wrapper = await mount(
			<Timeline
				{...rest}
				tail={[]}
				loadMoreChannelData={loadMoreChannelData}
			/>,
			{
				wrappingComponent: wrapperWithSetup,
				wrappingComponentProps: {
					sdk: rest.sdk,
				},
			},
		);

		const timeline = wrapper.childAt(0);

		// Make sure we are testing the correct thing (see previous tests)
		timeline.setState({
			ready: true,
			reachedBeginningOfTimeline: false,
		});

		const infiniteList = wrapper.find(InfiniteList).getDOMNode();
		expect(infiniteList.scrollHeight).toBe(700);
		expect(infiniteList.clientHeight).toBe(500);

		expect(loadMoreChannelData.callCount).toBe(0);
	},
);

test('loadMoreChannelData is called when the user reaches the top of the scroll', async () => {
	const {
		eventProps: { loadMoreChannelData, ...rest },
	} = context;

	simulateOverflow();

	const wrapper = await mount(
		<Timeline {...rest} tail={[]} loadMoreChannelData={loadMoreChannelData} />,
		{
			wrappingComponent: wrapperWithSetup,
			wrappingComponentProps: {
				sdk: rest.sdk,
			},
		},
	);

	const timeline = wrapper.childAt(0);

	// Make sure we are testing the correct thing (see previous tests)
	timeline.setState({
		ready: true,
		reachedBeginningOfTimeline: false,
	});

	const infiniteList = wrapper.find(InfiniteList);

	const infiniteListElement = infiniteList.getDOMNode();
	expect(infiniteListElement.scrollHeight).toBe(700);
	expect(infiniteListElement.clientHeight).toBe(500);

	expect(loadMoreChannelData.callCount).toBe(0);

	infiniteList.simulate('scroll');

	expect(infiniteListElement.scrollTop).toBe(0);
	expect(loadMoreChannelData.callCount).toBe(1);
});

test(
	'loadMoreChannelData is called when there is an event in the url ' +
		'and the user reaches the top of the scroll',
	async () => {
		const {
			eventProps: { loadMoreChannelData, ...rest },
		} = context;

		const eventId = 'fake-event-id';

		simulateOverflow();
		addEventToLocation(eventId);

		const wrapper = await mount(
			<Timeline
				{...rest}
				tail={[
					{
						id: 'fake-event-id',
						type: 'message@1.0.0',
						slug: 'message-1',
						data: {
							readBy: [],
						},
					},
				]}
				loadMoreChannelData={loadMoreChannelData}
			/>,
			{
				wrappingComponent: wrapperWithSetup,
				wrappingComponentProps: {
					sdk: rest.sdk,
				},
			},
		);

		const timeline = wrapper.childAt(0);
		expect(timeline.state('ready')).toBe(false);

		// Unfortunate delay required to ensure ready is set correctly
		await Bluebird.delay(2500);
		expect(timeline.state('ready')).toBe(true);

		const infiniteList = wrapper.find(InfiniteList);

		const infiniteListElement = infiniteList.getDOMNode();
		expect(infiniteListElement.scrollHeight).toBe(700);
		expect(infiniteListElement.clientHeight).toBe(500);

		expect(loadMoreChannelData.callCount).toBe(0);

		infiniteList.simulate('scroll');

		expect(infiniteListElement.scrollTop).toBe(0);
		expect(loadMoreChannelData.callCount).toBe(1);
	},
);

test(
	'loadMoreChannelData is used to get all the events for the timeline when' +
		'the event in the url is not present in our first page of results',
	async () => {
		const {
			eventProps: { card, ...rest },
		} = context;

		const eventId = 'fake-message-id';

		// eslint-disable-next-line prefer-reflect
		// delete window.location;

		// @ts-ignore
		global.window.location = {
			search: `?event=${eventId}`,
		};

		const tail = _.times(20, (index) => {
			return {
				id: `fake-event-${index}`,
				type: 'message@1.0.0',
				slug: `message=${index}`,
				data: {
					target: {
						id: 'fake-target-id',
					},
					readBy: [],
				},
			};
		});

		const loadMoreChannelData = sandbox.stub();
		loadMoreChannelData.resolves([
			{
				id: eventId,
				type: 'message@1.0.0',
				data: {
					target: {
						id: 'fake-target-id',
					},
					readBy: [],
				},
			},
		]);

		await mount(
			<Timeline
				{...rest}
				card={card}
				tail={tail}
				loadMoreChannelData={loadMoreChannelData}
			/>,
			{
				wrappingComponent: wrapperWithSetup,
				wrappingComponentProps: {
					sdk: rest.sdk,
				},
			},
		);
		await Bluebird.delay(2500);

		expect(loadMoreChannelData.callCount).toBe(1);
		expect(loadMoreChannelData.args).toEqual([
			[
				{
					target: card.slug,
					query: {
						type: 'object',
						properties: {
							id: {
								const: card.id,
							},
						},
						$$links: {
							'has attached element': {
								type: 'object',
							},
						},
					},
					queryOptions: {
						links: {
							'has attached element': {
								sortBy: 'created_at',
								sortDir: 'desc',
							},
						},
					},
				},
			],
		]);
	},
	25001,
);
