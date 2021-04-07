/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { Avatar, Box, Flex, FlexProps, TooltipPlacement } from 'rendition';
import { core } from '@balena/jellyfish-types';
import { CardLoader } from '../card-loader';
import UserStatusIcon from '../user-status-icon';
import { getUserTooltipText } from '../services/helpers';

const dimensions = ({ emphasized }: { emphasized?: boolean }) => {
	const top = emphasized ? -4 : -2;
	return `
		.user-status-icon {
			top: ${top}px;
			right: -2px;
		}
	`;
};

const Wrapper = styled(Flex)`
	position: relative;
	.user-status-icon {
		position: absolute;
	}
	box-sizing: content-box;
	${dimensions}
`;

export interface UserAvatarProps {
	user: core.UserContract;
	emphasized?: boolean;
	tooltipPlacement?: TooltipPlacement;
}

export const UserAvatar = React.memo<UserAvatarProps>(
	({ user, emphasized, tooltipPlacement = 'top' }) => {
		const firstName = _.get(user, ['data', 'profile', 'name', 'first']);
		const lastName = _.get(user, ['data', 'profile', 'name', 'last']);
		const src = _.get(user, ['data', 'avatar']);
		return (
			<Box
				data-test="avatar-wrapper"
				tooltip={{
					text: getUserTooltipText(user),
					placement: tooltipPlacement,
				}}
			>
				<Avatar
					emphasized={emphasized}
					firstName={firstName}
					lastName={lastName}
					// @ts-ignore
					src={src}
				/>
			</Box>
		);
	},
);

export interface UserAvatarLive
	extends FlexProps,
		Omit<UserAvatarProps, 'user'> {
	userId: string;
}

export const UserAvatarLive = React.memo<UserAvatarLive>(
	({ userId, emphasized, tooltipPlacement, ...rest }) => {
		return (
			<CardLoader<core.UserContract>
				id={userId}
				type="user"
				withLinks={['is member of']}
			>
				{(user) => {
					return (
						<Wrapper emphasized={emphasized} {...rest}>
							<UserAvatar
								emphasized={emphasized}
								user={user}
								tooltipPlacement={tooltipPlacement}
							/>
							<UserStatusIcon
								className="user-status-icon"
								small={!emphasized}
								userStatus={_.get(user, ['data', 'status'])}
							/>
						</Wrapper>
					);
				}}
			</CardLoader>
		);
	},
);
