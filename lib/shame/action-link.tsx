/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { Button, Link } from 'rendition';
import styled from 'styled-components';
import { Link as RouterLink } from '../link';

const action = <TProps extends {}>(Component: React.ComponentType<TProps>) => {
	return styled(Component)`
		&:hover {
			background-color: ${({ theme }) => {
				return theme.colors.gray.light;
			}} !important;
		}
		padding: 8px 16px;
		width: 100%;
		display: block !important;
		cursor: pointer;
	`;
};

export const ActionButton = action(Button);
export const ActionLink = action(Link);
export const ActionRouterLink = action(RouterLink);