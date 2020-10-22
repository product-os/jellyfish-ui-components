/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../../../test/ui-setup'
import ava from 'ava'
import sinon from 'sinon'
import {
	mount
} from 'enzyme'
import React from 'react'
import userWithOrg from './fixtures/user-with-org.json'
import {
	UserAvatar
} from '../'

const wrappingComponent = getWrapper().wrapper

const sandbox = sinon.createSandbox()

ava.beforeEach((test) => {
	test.context = {
		...test.context,
		commonProps: {
			emphasized: false,
			userId: userWithOrg.id,
			getCard: sandbox.stub(),
			selectCard: sandbox.stub().returns(() => {
				return userWithOrg
			})
		}
	}
	sandbox.restore()
})

ava.afterEach(() => {
	sandbox.restore()
})

ava('UserAvatar displays the user`s avatar, tooltip and status', async (test) => {
	const {
		commonProps
	} = test.context

	const component = await mount((
		<UserAvatar {...commonProps} />
	), {
		wrappingComponent
	})

	const avatar = component.find('AvatarBase')
	test.false(avatar.props().emphasized)
	test.is(avatar.props().firstName, 'Test')
	test.is(avatar.props().lastName, 'User')
	test.is(avatar.props().src, 'https://via.placeholder.com/150')

	const statusIcon = component.find('UserStatusIcon')
	test.is(statusIcon.props().small, !commonProps.emphasized)
	test.deepEqual(statusIcon.props().userStatus.value, 'DoNotDisturb')

	const wrapper = component.find('Box').first()
	test.is(wrapper.props().tooltip, 'Test User\ntest@jel.ly.fish')
})
