/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../../../../test/ui-setup'
import _ from 'lodash'
import ava from 'ava'
import sinon from 'sinon'
import {
	mount
} from 'enzyme'
import React from 'react'
import Body from '../Body'
import {
	card
} from './fixtures'

const wrappingComponent = getWrapper().wrapper
const sandbox = sinon.createSandbox()

ava.beforeEach((test) => {
	test.context.commonProps = {
		enableAutocomplete: false,
		sendCommand: 'enter',
		onUpdateDraft: sandbox.fake(),
		onSaveEditedMessage: sandbox.fake(),
		types: [],
		user: {
			slug: 'test-user'
		},
		sdk: {},
		card,
		actor: {},
		isMessage: true,
		editedMessage: null,
		updating: false,
		messageOverflows: false,
		setMessageElement: sandbox.fake(),
		messageCollapsedHeight: 400
	}
})

ava.afterEach(() => {
	sandbox.restore()
})

ava('Auto-complete textarea is shown if message is being edited', (test) => {
	const {
		commonProps
	} = test.context
	const eventBody = mount(
		<Body
			{...commonProps}
			editedMessage="test message"
			updating={false}
		/>
		, {
			wrappingComponent
		})
	const autoCompleteTextarea = eventBody.find('div[data-test="event__textarea"]')
	test.is(autoCompleteTextarea.length, 1)
})

ava('Edited message is shown in markdown if message is being updated', (test) => {
	const {
		commonProps
	} = test.context
	const editedMessage = 'test message'
	const eventBody = mount(
		<Body
			{...commonProps}
			editedMessage={editedMessage}
			updating
		/>
		, {
			wrappingComponent
		})
	const autoCompleteTextarea = eventBody.find('div[data-test="event__textarea"]')
	test.is(autoCompleteTextarea.length, 0)
	const messageText = eventBody.find('div[data-test="event-card__message-draft"]')
	test.is(messageText.text(), editedMessage)
})

ava('An error is captured by the component and an error message is rendered', (test) => {
	const {
		commonProps
	} = test.context

	const eventBody = mount(
		<Body
			{...commonProps}
		/>
		, {
			wrappingComponent
		})

	const error = new Error()
	eventBody.childAt(0).childAt(0).simulateError(error)

	const message = eventBody.first('div[data-test="eventBody__errorMessage"]')
	test.is(message.text(), 'An error occured while attempting to render this message')
})

ava('Hidden front URLs are not displayed in the message', (test) => {
	const {
		commonProps
	} = test.context

	const frontCard = _.merge({}, card, {
		data: {
			payload: {
				message: 'Line1\n[](https://www.balena-cloud.com?hidden=whisper&source=flowdock)'
			}
		}
	})

	const eventBody = mount(
		<Body
			{...commonProps}
			card={frontCard}
		/>
		, {
			wrappingComponent
		})

	const message = eventBody.first('[data-test="event-card__message"]')
	test.is(message.text().trim(), 'Line1')
})
