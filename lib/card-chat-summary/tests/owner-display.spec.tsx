/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import '../../../test/ui-setup';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import React from 'react';
import userWithOrg from './fixtures/user-2.json';
import { OwnerDisplay } from '../owner-display';

const sandbox = sinon.createSandbox();

afterEach(() => {
	sandbox.restore();
});

test('OwnerDisplay displays the user avatar and the message text', async () => {
	const component = shallow(<OwnerDisplay owner={userWithOrg} />);

	const userIcon = component.find('Icon');
	expect(userIcon.props().name).toBe('user');

	const avatar: any = component.find('Memo()');
	expect(avatar.props().userId).toBe(userWithOrg.id);
});
