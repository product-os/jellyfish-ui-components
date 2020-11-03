/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import {
	Avatar,
	Flex
} from 'rendition'
import CardLoader from '../CardLoader'
import UserStatusIcon from '../UserStatusIcon'
import {
	generateActorFromUserCard
} from '../services/helpers'

const dimensions = ({
	emphasized
}) => {
	const top = emphasized ? -4 : -2
	return `
		.user-status-icon {
			top: ${top}px;
			right: -2px;
		}
	`
}

const Wrapper = styled(Flex) `
	position: relative;
	.user-status-icon {
		position: absolute;
	}
	box-sizing: content-box;
	${dimensions}
`

export const UserAvatar = React.memo(({
	userId, selectCard, getCard, emphasized, ...rest
}) => {
	return (
		<CardLoader
			id={userId}
			type="user"
			withLinks={[ 'is member of' ]}
			cardSelector={selectCard}
			getCard={getCard}
		>
			{(user) => {
				const actor = generateActorFromUserCard(user)
				const tooltip = actor && `${_.truncate(actor.name, 30)}\n${_.truncate(actor.email, 30)}`
				return (
					<Wrapper
						tooltip={tooltip}
						emphasized={emphasized}
						{...rest}
					>
						<Avatar
							emphasized={emphasized}
							firstName={_.get(user, [ 'data', 'profile', 'name', 'first' ])}
							lastName={_.get(user, [ 'data', 'profile', 'name', 'last' ])}
							src={_.get(user, [ 'data', 'avatar' ])}
						/>
						<UserStatusIcon
							className="user-status-icon"
							small={!emphasized}
							userStatus={_.get(user, [ 'data', 'status' ])}
						/>
					</Wrapper>
				)
			}}
		</CardLoader>
	)
})
