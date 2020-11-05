/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	circularDeepEqual
} from 'fast-equals'
import React from 'react'
import Wrapper from './Wrapper'
import Header from './Header'
import Content from './Content'

const Update = ({
	card, actor
}) => {
	return (
		<Wrapper card={card}>
			<Header actor={actor} card={card} />
			<Content card={card} />
		</Wrapper>
	)
}

export default React.memo(Update, circularDeepEqual)
