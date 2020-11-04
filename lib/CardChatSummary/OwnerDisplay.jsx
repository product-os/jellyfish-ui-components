/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	Flex
} from 'rendition'
import {
	UserAvatar
} from '../UserAvatar'
import Icon from '../shame/Icon'

export const OwnerDisplay = ({
	owner, selectCard, getCard, ...rest
}) => {
	if (!owner) {
		return null
	}
	return (
		<Flex
			{...rest}
			alignItems="center"
			tooltip={`Owned by ${owner.name || owner.slug}`}
		>
			<Icon name="user" regular />
			<UserAvatar
				ml={2}
				userId={owner.id}
				selectCard={selectCard}
				getCard={getCard}
			/>
		</Flex>
	)
}