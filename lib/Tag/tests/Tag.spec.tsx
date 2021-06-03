/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import '../../../test/ui-setup';
import { shallow } from 'enzyme';
import React from 'react';
import { Tag } from '../';

test('It should render', () => {
	shallow(<Tag>#foobar</Tag>);
});
