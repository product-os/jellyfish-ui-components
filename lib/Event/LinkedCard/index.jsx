/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	circularDeepEqual
} from 'fast-equals'
import * as helpers from '../../services/helpers'

import Wrapper from '../Wrapper'
import Header from '../Header'
import Context from './Context'
import Body from './Body'

const LinkedCard = ({
	actor, card, targetCard
}) => {
	const linkedCardInfo = helpers.getLinkedCardInfo(card, targetCard)
	return (
		<Wrapper key={card.id} card={card}>
			<Header card={linkedCardInfo}>
				<Context actor={actor} linkedCardInfo={linkedCardInfo} card={card} />
			</Header>
			<Body card={linkedCardInfo} />
		</Wrapper>
	)
}

export default React.memo(LinkedCard, circularDeepEqual)
