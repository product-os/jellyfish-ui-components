/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import _ from 'lodash';
import { Flex, FlexProps } from 'rendition';
import { Markdown } from 'rendition/dist/extra/Markdown';
import { UserAvatarLive } from '../user-avatar';
import { CardLoader } from '../card-loader';
import MessageContainer from '../event/message/message-container';
import { RE_FRONT_HIDDEN_URL } from '../event/message/body';
import { HIDDEN_ANCHOR } from '../timeline';
import { linkComponentOverride } from '../link';
import { getMessage, generateActorFromUserCard } from '../services/helpers';
import { core } from '@balena/jellyfish-types';

const componentOverrides = {
	// TS-TODO
	img: (attribs: any) => {
		return <span>[{attribs.title || attribs.alt || 'image'}]</span>;
	},
	// eslint-disable-next-line id-length
	a: linkComponentOverride({
		blacklist: [RE_FRONT_HIDDEN_URL],
	}),
};

interface MessageSnippetProps extends FlexProps {
	messageCard: core.Contract<{ actor: string }>;
}

export const MessageSnippet = React.memo<MessageSnippetProps>(
	({ messageCard, ...rest }) => {
		if (!messageCard) {
			return null;
		}

		const messageText = React.useMemo(() => {
			return getMessage(messageCard)
				.replace(/```[^`]*```/, '`<code block>`')
				.split('\n')
				.map((line) => {
					return line.includes(HIDDEN_ANCHOR) ? '[attachment]' : line;
				})
				.shift()!;
		}, [messageCard]);

		const userId = _.get(messageCard, ['data', 'actor']);

		return (
			<CardLoader<core.UserContract>
				id={userId}
				type="user"
				withLinks={['is member of']}
			>
				{(user) => {
					const actor = generateActorFromUserCard(user);
					return (
						<Flex alignItems="flex-start" {...rest}>
							<UserAvatarLive userId={userId} />
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
									// @ts-ignore
									componentOverrides={componentOverrides}
								>
									{messageText}
								</Markdown>
							</MessageContainer>
						</Flex>
					);
				}}
			</CardLoader>
		);
	},
);