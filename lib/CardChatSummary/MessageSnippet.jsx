/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import {
	Flex,
	Link
} from 'rendition'
import {
	Markdown
} from 'rendition/dist/extra/Markdown'
import {
	UserAvatar
} from '../UserAvatar'
import CardLoader from '../CardLoader'
import MessageContainer from '../Event/MessageContainer'
import {
	HIDDEN_ANCHOR
} from '../Timeline'
import {
	generateActorFromUserCard
} from '../services/helpers'

const componentOverrides = {
	img: (attribs) => {
		return <span>[{attribs.title || attribs.alt || 'image'}]</span>
	},
	// eslint-disable-next-line id-length
	a: (attribs) => {
		// The whole chat summary is clickable. Prevent navigating to the
		// chat/thread channel when clicking on a link within the last message
		// summary.
		const onClick = (event) => {
			event.stopPropagation()
			event.preventDefault()
			window.open(attribs.href)
		}
		return <Link blank {...attribs} onClick={onClick} />
	}
}

export const MessageSnippet = React.memo(({
	messageCard, selectCard, getCard, ...rest
}) => {
	if (!messageCard) {
		return null
	}

	const messageText = React.useMemo(() => {
		return _.get(messageCard, [ 'data', 'payload', 'message' ], '')
			.replace(/```[^`]*```/, '`<code block>`')
			.split('\n')
			.map((line) => {
				return line.includes(HIDDEN_ANCHOR) ? '[image]' : line
			})
			.shift()
	}, [ messageCard ])

	const userId = _.get(messageCard, [ 'data', 'actor' ])

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
				return (
					<Flex alignItems="flex-start" {...rest}>
						<UserAvatar
							userId={userId}
							selectCard={selectCard}
							getCard={getCard}
						/>
						<MessageContainer
							truncated
							flex={1}
							card={messageCard}
							actor={actor}
							squashTop={false}
							squashBottom={false}
							py={2}
							px={3}
							ml={2}
							mr={-3}
						>
							<Markdown
								data-test="card-chat-summary__message"
								componentOverrides={componentOverrides}
							>
								{messageText}
							</Markdown>
						</MessageContainer>
					</Flex>
				)
			}}
		</CardLoader>
	)
})