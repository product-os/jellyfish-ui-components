/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { compose } from 'redux';
import type { core } from '@balena/jellyfish-types';
import { parseMessage } from './message/body';
import { CardLoader } from '../card-loader';
import * as helpers from '../services/helpers';
import withCardUpdater from '../h-o-c/with-card-updater';
import { withSetup } from '../setup-provider';

import { UPDATE, LINK } from '../constants';
import Update from './update';
import LinkedCard from './linked-card';
import Message from './message';

export { parseMessage };

const EventWithActor: React.FunctionComponent<any> = (props) => {
	const { card, user, onCardVisible, targetCard } = props;
	const typeBase = props.card.type.split('@')[0];
	return (
		<CardLoader<core.UserContract>
			id={helpers.getActorIdFromCard(props.card)}
			type="user"
			withLinks={['is member of']}
		>
			{(author) => {
				const actor = helpers.generateActorFromUserCard(author);
				if (typeBase === UPDATE) {
					return (
						<Update
							onCardVisible={onCardVisible}
							card={card}
							user={user}
							actor={actor}
						/>
					);
				}
				if (typeBase === LINK) {
					return (
						<LinkedCard actor={actor} card={card} targetCard={targetCard} />
					);
				}
				return <Message {...props} actor={actor} />;
			}}
		</CardLoader>
	);
};

export default compose<any>(withSetup, withCardUpdater(true))(EventWithActor);
