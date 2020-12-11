/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../test/ui-setup'
import React from 'react'
import ava from 'ava'
import sinon from 'sinon'
import {
	mount
} from 'enzyme'
import {
	CardLoader
} from './CardLoader'

const sandbox = sinon.createSandbox()

const testCard = {
	id: '1',
	type: 'user',
	version: '1.0.0',
	slug: 'user-test'
}

const getWrappingComponent = (card) => {
	return getWrapper({}, {
		getCard: sandbox.stub().resolves(card),
		selectCard: sandbox.stub().returns(sandbox.stub().returns(card))
	}).wrapper
}

ava.afterEach(() => {
	sandbox.restore()
})

ava('CardLoader children must be a function', async (test) => {
	test.throws(() => {
		mount((
			<CardLoader id="1" type="user" card={null} withLinks={[ 'is member of' ]}>
				<div>Test</div>
			</CardLoader>
		), {
			wrappingComponent: getWrappingComponent(testCard)
		})
	})
})

ava('CardLoader passes card to its child function', async (test) => {
	const children = sinon.fake.returns(<div>Test</div>)
	await mount((
		<CardLoader
			id={testCard.id}
			type={testCard.type}
			withLinks={[ 'is member of' ]}
		>
			{children}
		</CardLoader>
	), {
		wrappingComponent: getWrappingComponent(testCard)
	})
	test.is(children.callCount, 1)
	test.is(children.getCall(0).args[0], testCard)
})

ava('CardLoader calls getCard callback if card prop is null', async (test) => {
	const children = sinon.fake.returns(<div>Test</div>)
	const getCard = sandbox.stub().resolves(null)
	await mount((
		<CardLoader
			id={testCard.id}
			type={testCard.type}
			withLinks={[ 'is member of' ]}
		>
			{children}
		</CardLoader>
	), {
		wrappingComponent: getWrapper({}, {
			getCard,
			selectCard: sandbox.stub().returns(sandbox.stub().returns(null))
		}).wrapper
	})
	test.is(getCard.callCount, 1)
	test.deepEqual(getCard.getCall(0).args, [ testCard.id, testCard.type, [ 'is member of' ] ])
})
