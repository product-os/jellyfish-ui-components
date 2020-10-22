/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../../../test/ui-setup'
import ava from 'ava'
import {
	mount
} from 'enzyme'
import sinon from 'sinon'
import React from 'react'
import msg from './fixtures/msg-text.json'
import userWithOrg from './fixtures/user2.json'
import {
	MessageSnippet
} from '../MessageSnippet'

const wrappingComponent = getWrapper().wrapper

const sandbox = sinon.createSandbox()

ava.afterEach(() => {
	sandbox.restore()
})

ava('MessageSnippet displays the user avatar and the message text', async (test) => {
	const selectCard = sandbox.stub().returns(() => {
		return userWithOrg
	})
	const getCard = sandbox.stub()
	const component =	await mount((
		<MessageSnippet
			messageCard={msg}
			selectCard={selectCard}
			getCard={getCard}
		/>
	), {
		wrappingComponent
	})

	// The UserStatusIcon is part of the user avatar component
	const userStatusIcon = component.find('UserStatusIcon')
	test.is(userStatusIcon.props().userStatus.value, 'DoNotDisturb')

	const txt = component.find('p').first()
	test.is(txt.text(), msg.data.payload.message)
})
