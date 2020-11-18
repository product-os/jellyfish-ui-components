/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import {
	Flex
} from 'rendition'
import {
	Markdown
} from 'rendition/dist/extra/Markdown'
import {
	UserAvatarLive
} from '../UserAvatar'
import CardLoader from '../CardLoader'
import MessageContainer from '../Event/Message/MessageContainer'
import {
	HIDDEN_ANCHOR
} from '../Timeline'
import Link from '../Link'
import {
	getLinkProps
} from '../Link/Link'
import {
	getMessage,
	generateActorFromUserCard
} from '../services/helpers'

const componentOverrides = {
	img: (attribs) => {
		return <span>[{attribs.title || attribs.alt || 'image'}]</span>
	},
	// eslint-disable-next-line id-length
	a: ({
		href, ...rest
	}) => {
		const linkProps = getLinkProps(href)
		return <Link {...rest} {...linkProps} />
	}
}

export const MessageSnippet = React.memo(({
	messageCard, selectCard, getCard, ...rest
}) => {
	if (!messageCard) {
		return null
	}

	const messageText = React.useMemo(() => {
		return getMessage(messageCard)
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
						<UserAvatarLive
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
