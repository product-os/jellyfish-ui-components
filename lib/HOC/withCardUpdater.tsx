/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import type { core } from '@balena/jellyfish-types';
import type { Operation } from 'fast-json-patch';
import { useSetup } from '../SetupProvider';
import { addNotification } from '../services/notifications';

type UpdateCardHandler = (card: core.Contract, patch: Operation[]) => unknown;

interface WithCardUpdaterProps {
	actions: any;
	onUpdateCard: UpdateCardHandler;
}

export default function withCardUpdater<
	TProps extends Omit<WithCardUpdaterProps, 'onUpdateCard'>,
>(skipNotification = false) {
	return (
		BaseComponent: React.ComponentType<TProps & WithCardUpdaterProps>,
	) => {
		return (props: React.PropsWithChildren<TProps>) => {
			const { sdk, analytics } = useSetup()!;
			const onUpdateCard: UpdateCardHandler = (card, patch) => {
				if (patch.length) {
					return sdk.card
						.update(card.id, card.type, patch)
						.then((response) => {
							analytics.track('element.update', {
								element: {
									id: card.id,
									type: card.type,
								},
							});
							return response;
						})
						.then((response) => {
							if (!skipNotification) {
								addNotification('success', `Updated ${card.name || card.slug}`);
							}
							return response;
						})
						.catch((error) => {
							console.log(error, error.message);
							addNotification('danger', error.message || error);
						});
				}
				return null;
			};
			return <BaseComponent {...props} onUpdateCard={onUpdateCard} />;
		};
	};
}