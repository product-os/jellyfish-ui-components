/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import path from 'path';
import { withDefaultProps } from './withDefaultProps';

const getActorHref = (actor: any) => {
	return path.join(location.pathname, actor.card.slug);
};

export const withDefaultGetActorHref = () => {
	return withDefaultProps({
		getActorHref,
	});
};