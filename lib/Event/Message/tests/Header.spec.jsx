/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../../../../test/ui-setup'
import ava from 'ava'
import sinon from 'sinon'
import {
	mount
} from 'enzyme'
import React from 'react'
import Header from '../Header'
import {
	card
} from './fixtures'

const wrappingComponent = getWrapper().wrapper

const sandbox = sinon.createSandbox()

ava.beforeEach((test) => {
	test.context.commonProps = {
		isMessage: true,
		actor: {},
		card,
		threadIsMirrored: true,
		menuOptions: [],
		user: {
			slug: 'test-user'
		},
		updating: false,
		onEditMessage: sandbox.stub()
	}
})

ava.afterEach(() => {
	sandbox.restore()
})

ava('\'updating...\' is displayed if card is updating and editing', async (test) => {
	const {
		commonProps
	} = test.context
	const messageHeader = await mount((
		<Header
			{...commonProps}
			updating
			editing
		/>
	), {
		wrappingComponent
	})
	const status = messageHeader.find('Txt[data-test="event-header__status"]')
	test.is(status.text(), 'updating...')
})

ava('\'Edit Message\' is not available if the user did not write the message', async (test) => {
	const {
		commonProps
	} = test.context
	const messageHeader = await mount((
		<Header
			{...commonProps}
		/>
	), {
		wrappingComponent
	})

	const trigger = messageHeader.find('button[data-test="event-header__context-menu-trigger"]')
	trigger.simulate('click')
	messageHeader.update()

	// The 'Copy JSON' link is now shown but the 'Edit Message' link is not
	test.truthy(messageHeader.find('a[data-test="event-header__link--copy-json"]').length)
	test.falsy(messageHeader.find('a[data-test="event-header__link--edit-message"]').length)
})

ava('Clicking \'Edit Message\' calls the onEditMessage prop callback', async (test) => {
	const {
		commonProps
	} = test.context
	const messageHeader = await mount((
		<Header
			{...commonProps}
			user={{
				id: card.data.actor
			}}
		/>
	), {
		wrappingComponent
	})

	const trigger = messageHeader.find('button[data-test="event-header__context-menu-trigger"]')
	trigger.simulate('click')
	messageHeader.update()

	test.is(commonProps.onEditMessage.callCount, 0)
	messageHeader.find('a[data-test="event-header__link--edit-message"]').simulate('click')
	test.is(commonProps.onEditMessage.callCount, 1)
})