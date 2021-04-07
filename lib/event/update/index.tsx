/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { circularDeepEqual } from 'fast-equals';
import React from 'react';
import Wrapper from '../wrapper';
import Header from '../header';
import Body from './body';
import Context from './context';

const Update = ({ card, actor }: any) => {
	return (
		<Wrapper card={card}>
			<Header card={card}>
				<Context card={card} actor={actor} />
			</Header>
			<Body card={card} />
		</Wrapper>
	);
};

export default React.memo(Update, circularDeepEqual);
