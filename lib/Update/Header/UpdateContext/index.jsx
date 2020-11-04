import React from 'react'
import _ from 'lodash'
import {
	circularDeepEqual
} from 'fast-equals'
import {
	Flex,
	Txt
} from 'rendition'
import Icon from '../../../shame/Icon'
import * as helpers from '../../../services/helpers'
import ActorMessage from './ActorMessage'

const formatTimestamp = (card) => {
	const timestamp = _.get(card, [ 'data', 'timestamp' ]) || card.created_at
	return helpers.formatTimestamp(timestamp, true)
}

const UpdateContext = ({
	actor, card
}) => {
	const formattedTimestamp = formatTimestamp(card)
	return (
		<Flex alignItems="center">
			<Icon name="pencil-alt" />
			<Txt ml={2}>
				<ActorMessage actor={actor} />
				{ formattedTimestamp }
			</Txt>
		</Flex>
	)
}

export default React.memo(UpdateContext, circularDeepEqual)
