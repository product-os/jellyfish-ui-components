/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import {
	circularDeepEqual
} from 'fast-equals'
import {
	Flex,
	Txt
}	from 'rendition'
import Icon from '../../shame/Icon'
import Link from '../../Link'

const Body = ({
	card
}) => {
	const linkToCard = `https://jel.ly.fish/${card.id}`
	const {
		name, slug, id
	} = _.pick(card, [ 'name', 'slug', 'id' ])
	return (
		<Flex align="center" ml="23px">
			<Icon name="level-up-alt" rotate="90" />
			<Link to={linkToCard}>
				<Txt ml={3} italic>{ name || slug || id }</Txt>
			</Link>
		</Flex>
	)
}

export default React.memo(Body, circularDeepEqual)