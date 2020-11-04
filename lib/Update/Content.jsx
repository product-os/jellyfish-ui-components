import React from 'react'
import {
	circularDeepEqual
} from 'fast-equals'
import {
	Flex,
	Txt
}	from 'rendition'
import _ from 'lodash'
import {
	commaListsAnd
} from 'common-tags'
import Icon from '../shame/Icon'
import * as helpers from '../services/helpers'

const getUpdateDescription = (card) => {
	if (card.name) {
		return card.name
	}
	const operation = _.some(card.data.payload, 'op')
	if (operation) {
		const patchDescription = helpers.generateJSONPatchDescription(card.data.payload)
		return commaListsAnd `${patchDescription}`
	}
	return null
}

const Content = ({
	card
}) => {
	const description = getUpdateDescription(card)
	if (!description) {
		return null
	}
	return (
		<Flex align="center" ml="23px">
			<Icon name="level-up-alt" rotate="90" />
			<Txt ml={3} italic>{description}</Txt>
		</Flex>
	)
}

export default React.memo(Content, circularDeepEqual)