/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import '../../../test/ui-setup'
import ava from 'ava'
import {
	shallow
} from 'enzyme'
import sinon from 'sinon'
import React from 'react'
import userWithOrg from './fixtures/user2.json'
import {
	OwnerDisplay
} from '../OwnerDisplay'

const sandbox = sinon.createSandbox()

ava.afterEach(() => {
	sandbox.restore()
})

ava('OwnerDisplay displays the user avatar and the message text', async (test) => {
	const selectCard = sandbox.stub().returns(() => {
		return userWithOrg
	})
	const getCard = sandbox.stub()
	const component =	shallow(
		<OwnerDisplay
			owner={userWithOrg}
			selectCard={selectCard}
			getCard={getCard}
		/>
	)

	const userIcon = component.find('Icon')
	test.is(userIcon.props().name, 'user')

	const avatar = component.find('Memo()')
	test.is(avatar.props().userId, userWithOrg.id)
})
