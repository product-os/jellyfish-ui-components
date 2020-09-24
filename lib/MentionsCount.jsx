/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	Box
} from 'rendition'
import styled from 'styled-components'

const getFontSize = (string) => {
	if (string.length === 1) {
		return 14
	}

	if (string.length === 2) {
		return 12
	}

	return 10
}

const MentionsCount = styled(Box) `
	background: ${(props) => { return props.theme.colors.primary.light }};
	color: ${(props) => { return props.theme.colors.primary.dark }};
	width: auto;
	min-width: 18px;
	height: 18px;
	padding: 0px 4px;
	border: 1px solid;
	border-radius: 18px;
	transform: translateX(6px);
	display: inline-flex;
	justify-content: center;
	align-items: center;
	font-weight: bold;
	font-size: ${(props) => {
		return getFontSize(props.children)
	}}px;
`

export default MentionsCount
