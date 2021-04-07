/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import omit from 'lodash/omit';
import React from 'react';
import { Flex } from 'rendition';
import styled from 'styled-components';

const ColumnBase = styled(Flex).attrs({
	flexDirection: 'column',
	flex: '1',
})`
	height: 100%;
	min-width: 270px;
`;

interface ColumnProps {
	overflowY?: string;
}

const Column: React.FunctionComponent<ColumnProps> = (props) => {
	const { overflowY } = props;

	const rest = omit(props, 'overflowY');

	const style = overflowY
		? {
				overflowY: 'auto',
		  }
		: {};

	return (
		<ColumnBase
			{...rest}
			// @ts-ignore
			style={style}
		/>
	);
};

export default Column;
