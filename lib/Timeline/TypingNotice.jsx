/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	Box
} from 'rendition'
import styled from 'styled-components'
import {
	commaListsAnd
} from 'common-tags'

const StyledBox = styled.div `
	background: ${(props) => { return props.theme.background.main }};
	border: 1px solid ${(props) => { return props.theme.background.dark }};
	border-radius: ${(props) => { return props.theme.border }}px;
	color: ${(props) => { return props.theme.text.main }};
	margin-left: ${(props) => { return props.theme.space[3] }}px;
	transform: translateY(-10px);
	height: 0;
	overflow: visible;
	> * {
		display: inline-block;
		border-radius: 3px;
		padding: 0 5px;
		box-shadow: rgba(0,0,0,0.25) 0px 0px 3px;
	}
`

const getTypingMessage = (usersTyping) => {
	if (usersTyping.length === 1) {
		return `${usersTyping[0].slice(5)} is typing...`
	} else if (usersTyping.length > 1) {
		const typing = usersTyping.map((slug) => {
			return slug.slice(5)
		})
		return commaListsAnd `${typing} are typing...`
	}
	return null
}

const TypingNotice = ({
	usersTyping
}) => {
	const typingMessage = getTypingMessage(usersTyping)
	if (typingMessage) {
		return (
			<StyledBox data-test="typing-notice">
				<em>{typingMessage}</em>
			</StyledBox>
		)
	}
	return null
}

export default TypingNotice
