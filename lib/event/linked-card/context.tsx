/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { circularDeepEqual } from 'fast-equals';
import { Flex, Txt } from 'rendition';
import * as helpers from '../../services/helpers';
import Icon from '../../shame/icon';
import Space from '../../shame/space';
import ActorMessage from '../actor-message';

const Context = ({ actor, linkedCardInfo, card }: any) => {
	const formattedCreatedAt = helpers.formatCreatedAt(card);
	const formattedType = helpers.formatCardType(linkedCardInfo.type);
	return (
		<Flex alignItems="center">
			<Icon name="link" />
			<Txt ml={2}>
				<ActorMessage actor={actor} suffix="added link to" />
				<Space />
				<b>{formattedType}</b>
				<Space />
				<span>{formattedCreatedAt}</span>
			</Txt>
		</Flex>
	);
};

export default React.memo(Context, circularDeepEqual);
