/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import _ from 'lodash';
import { circularDeepEqual } from 'fast-equals';
import { Flex, Txt } from 'rendition';
import Icon from '../../shame/icon';
import Space from '../../shame/space';
import * as helpers from '../../services/helpers';
import ActorMessage from '../actor-message';

const UpdateMessage = ({ actor, updateReason, formattedCreatedAt }: any) => {
	if (updateReason) {
		const updateMessage = `${updateReason} ${formattedCreatedAt}`;
		return <Txt ml={2}>{updateMessage}</Txt>;
	}
	return (
		<Txt ml={2}>
			<ActorMessage actor={actor} suffix="updated this" />
			<Space />
			{formattedCreatedAt}
		</Txt>
	);
};

const Context = ({ card, actor }: any) => {
	const updateReason = _.get(card, ['name']);
	const formattedCreatedAt = helpers.formatCreatedAt(card);
	const iconName = updateReason ? 'lightbulb' : 'pencil-alt';
	return (
		<Flex alignItems="center">
			<Icon name={iconName} />
			<UpdateMessage
				actor={actor}
				updateReason={updateReason}
				formattedCreatedAt={formattedCreatedAt}
			/>
		</Flex>
	);
};

export default React.memo(Context, circularDeepEqual);
