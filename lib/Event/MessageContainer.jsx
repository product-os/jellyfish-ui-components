/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import styled from 'styled-components'
import {
	Box
} from 'rendition'

const MessageContainer = styled(Box) `
	border-radius: 6px;
	border-top-left-radius: 0;
	box-shadow: -5px 4.5px 11px 0 ${(props) => {
		return props.theme.colors.border.main
	}};
	color: ${(props) => { return props.theme.colors.text.main }};

	a {
		color: inherit;
		text-decoration: underline;
	}

	img {
		background-color: transparent !important;
		&.emoji {
			width: 20px;
			height: 20px;
			vertical-align: middle;
		}
	}

	code {
		color: ${(props) => { return props.theme.colors.text.dark }};
		background-color: ${(props) => { return props.theme.colors.background.semilight }};
	}


	${({
		card, actor, theme, editing, error
	}) => {
		if (error) {
			return `
				color: ${theme.colors.background.main};
				background: ${theme.colors.warning.main};
			`
		}

		if (editing) {
			return `border: solid 1px ${theme.colors.info.main};`

			// Trying what it looks like with just a info border
			// Return (card.type === 'whisper' || card.type === 'whisper@1.0.0') ? `
			// 	border: solid 1px ${theme.colors.primary.dark};
			// 	background: ${theme.colors.text.light};
			// 	color: ${theme.colors.primary.dark};
			// ` : `
			// 	border: solid 1px ${theme.colors.border.main};
			// 	background: ${theme.colors.background.light};
			// 	color: ${theme.colors.text.main};
			// `
		}

		if (card.type === 'whisper' || card.type === 'whisper@1.0.0' ||
			card.type === 'summary' || card.type === 'summary@1.0.0') {
			return `
				background: ${theme.colors.primary.dark};
				color: ${theme.colors.text.light};
				border: solid 1px ${theme.colors.primary.dark};

				blockquote {
					color: ${theme.colors.text.main};
				}
			`
		}

		if (actor && actor.proxy) {
			return `
				background: ${theme.colors.primary.main};
				color: ${theme.colors.text.dark};
			`
		}

		return `
			border: solid 1px ${theme.colors.border.dark};
			background: ${theme.colors.background.main};
		`
	}}

	${({
		squashTop
	}) => {
		return squashTop
			? `
				border-top-right-radius: 0;
				border-top-left-radius: 0;
			` : ''
	}}

	${({
		squashBottom
	}) => {
		return squashBottom
			? `
				border-bottom-right-radius: 0;
				border-bottom-left-radius: 0;
				border-bottom-color: transparent;
			` : ''
	}}
`

export default MessageContainer
