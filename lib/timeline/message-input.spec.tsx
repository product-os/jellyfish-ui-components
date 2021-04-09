/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { getWrapper } from '../../test/ui-setup';
import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import MessageInput from './message-input';

const wrappingComponent = getWrapper().wrapper;
const sandbox = sinon.createSandbox();

afterEach(async () => {
	sandbox.restore();
});

test('MessageInput calls onFileChange when pasting files', () => {
	const handleFileChange = sandbox.spy();

	const wrapper = mount(
		// @ts-ignore
		<MessageInput files={[]} onFileChange={handleFileChange} />,
		{
			wrappingComponent,
		},
	);

	const textarea = wrapper.find('textarea');
	const file = new File([new Blob()], 'image.png', {
		type: 'image/png',
	});

	textarea.simulate('paste', {
		clipboardData: {
			files: [file],
		},
	});

	expect(handleFileChange.calledOnce).toBe(true);
	expect(handleFileChange.getCall(0).args[0][0]).toBe(file);
});
