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
	Box,
	Flex
} from 'rendition'
import {
	CardLoader
} from '../CardLoader'
import UserStatusIcon from '../UserStatusIcon'
import {
	getUserTooltipText
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
	user, emphasized, tooltipPlacement = 'top'
}) => {
	const firstName = _.get(user, [ 'data', 'profile', 'name', 'first' ])
	const lastName = _.get(user, [ 'data', 'profile', 'name', 'last' ])
	const src = _.get(user, [ 'data', 'avatar' ])
	return (
		<Box
			data-test="avatar-wrapper"
			tooltip={{
				text: getUserTooltipText(user),
				placement: tooltipPlacement
			}}
		>
			<Avatar
				emphasized={emphasized}
				firstName={firstName}
				lastName={lastName}
				src={src}
			/>
		</Box>
	)
})

export const UserAvatarLive = React.memo(({
	userId, emphasized, tooltipPlacement, ...rest
}) => {
	return (
		<CardLoader
			id={userId}
			type="user"
			withLinks={[ 'is member of' ]}
		>
			{(user) => {
				return (
					<Wrapper
						emphasized={emphasized}
						{...rest}
					>
						<UserAvatar
							emphasized={emphasized}
							user={user}
							tooltipPlacement={tooltipPlacement}
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
