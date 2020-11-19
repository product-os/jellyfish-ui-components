/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	getWrapper
} from '../../test/ui-setup'
import React from 'react'
import sinon from 'sinon'
import ava from 'ava'
import {
	mount
} from 'enzyme'
import {
	Link,
	getLinkProps
} from './Link'

const sandbox = sinon.createSandbox()

const wrappingComponent = getWrapper().wrapper

ava.afterEach(() => {
	sandbox.restore()
})

ava('getLinkProps populates append for relative URLs', (test) => {
	test.deepEqual(getLinkProps('/test?a=b'), {
		append: 'test?a=b'
	})
})

ava('getLinkProps populates append for local URLs', (test) => {
	test.deepEqual(getLinkProps(`https://${window.location.host}/test?a=b`), {
		append: 'test?a=b'
	})
})

ava('getLinkProps populates to and blank for external URLs', (test) => {
	test.deepEqual(getLinkProps('https://other.com/test?a=b'), {
		to: 'https://other.com/test?a=b',
		blank: true
	})
})

ava('Link calls history.push when blank prop is not set', async (test) => {
	const history = {
		push: sandbox.stub()
	}
	const component = await mount((
		<Link
			history={history}
			blank={false}
			to="http://google.com"
		/>
	), {
		wrappingComponent
	})

	component.simulate('click')

	test.true(history.push.calledOnce)
	test.is(history.push.getCall(0).args[0], 'http://google.com')
})

ava('Link does not call history.push when blank prop is set', async (test) => {
	const history = {
		push: sandbox.stub()
	}
	const component = await mount((
		<Link
			history={history}
			blank
			to="http://google.com"
		/>
	), {
		wrappingComponent
	})

	component.simulate('click')

	test.true(history.push.notCalled)
})
