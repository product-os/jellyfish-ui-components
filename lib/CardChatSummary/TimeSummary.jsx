/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import styled from 'styled-components'
import {
	Flex,
	Txt
} from 'rendition'
import Icon from '../shame/Icon'
import {
	timeAgo
} from '../services/helpers'

const SingleLine = styled(Txt) `
	white-space: nowrap;
`

export const TimeSummary = React.memo(({
	prefix, timestamp, iconName, ...rest
}) => {
	return (
		<Flex
			{...rest}
			alignItems="center"
			tooltip={`${prefix} ${timeAgo(timestamp)}`}
		>
			<Icon name={iconName} />
			<SingleLine ml={2} fontSize={12}>{timeAgo(timestamp, true)}</SingleLine>
		</Flex>
	)
})
