/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	Box
} from 'rendition'
import styled from 'styled-components'

const MenuPanel = styled(Box) `
	position: absolute;
	top: 64px;
	width: 180px;
	background: ${(props) => { return props.theme.colors.background.main }};
	box-shadow: 0 1px 4px rgba(17, 17, 17, 0.5);
	border-radius: 3px;

	&::before {
		content: '';
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-bottom: 5px solid ${(props) => { return props.theme.colors.border.dark }};
		position: absolute;
    top: -6px;
		left: 14px;
	}

	&::after {
		content: '';
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-bottom: 5px solid ${(props) => { return props.theme.colors.background.main }};
		position: absolute;
    top: -5px;
		left: 14px;
	}
`

export default MenuPanel
