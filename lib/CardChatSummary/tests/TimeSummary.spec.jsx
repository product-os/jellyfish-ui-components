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
import React from 'react'
import moment from 'moment'
import {
	TimeSummary
} from '../TimeSummary'

const prefix = 'Created'
const timestamp = moment().subtract(2, 'd').toISOString()
const iconName = 'history'

ava('TimeSummary displays the icon, tooltip and timeago text', (test) => {
	const component =	shallow(
		<TimeSummary
			prefix={prefix}
			timestamp={timestamp}
			iconName={iconName}
		/>
	)

	const wrapper = component.find('Flex')
	test.is(wrapper.props().tooltip, 'Created 2 days ago')

	const icon = component.find('Icon')
	test.is(icon.props().name, iconName)

	const txt = component.find('Styled(Txt)')
	test.is(txt.text(), '2 days')
})
