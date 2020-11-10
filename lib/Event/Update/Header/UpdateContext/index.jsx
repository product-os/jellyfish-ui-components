import React from 'react'
import _ from 'lodash'
import {
	circularDeepEqual
} from 'fast-equals'
import {
	Flex,
	Txt
} from 'rendition'
import { LINK } from '../../../../constants'
import Icon from '../../../../shame/Icon'
import * as helpers from '../../../../services/helpers'
import ActorMessage from './ActorMessage'

const formatTimestamp = (card) => {
	const timestamp = _.get(card, [ 'data', 'timestamp' ]) || card.created_at
	return helpers.formatTimestamp(timestamp, true)
}

const UpdateMessage = ({
	updateReason, actor, formattedTimestamp
}) => {
	if (updateReason) {
		const updateMessage = `${updateReason} ${formattedTimestamp}`
		return (
			<Txt ml={2}>{ updateMessage }</Txt>
		)
	}
	return (
		<Txt ml={2}>
			<ActorMessage actor={actor} />
			{ formattedTimestamp }
		</Txt>
	)
}

const getIconName = (updateReason, type) => {
	const typeBase = type.split('@')[0]
	if (typeBase === LINK){
		return 'link'
	}
	if (updateReason){
		return 'lightbulb'
	}
	return 'pencil-alt'
}

const UpdateContext = ({
	card, ...messageProps
}) => {
	const updateReason = _.get(card, [ 'name' ])
	const formattedTimestamp = formatTimestamp(card)
	const iconName = getIconName(updateReason, card.type)  
	return (
		<Flex alignItems="center">
			<Icon name={iconName} />
			<UpdateMessage {...messageProps} updateReason={updateReason} formattedTimestamp={formattedTimestamp} />
		</Flex>
	)
}

export default React.memo(UpdateContext, circularDeepEqual)
