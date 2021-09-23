/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { Box, BoxProps } from 'rendition';
import styled from 'styled-components';

const ScrollArea = styled(Box)`
	overflow-y: auto;
	height: 100%;
`;

const TRIGGEROFFSET = 200;

interface InfiniteListProps extends BoxProps {
	onScrollBeginning?: () => void;
	onScrollEnding?: () => void;
}

export class InfiniteList extends React.Component<InfiniteListProps> {
	scrollArea: any;

	constructor(props: any, context: any) {
		super(props, context);

		this.handleRef = this.handleRef.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
	}

	handleScroll() {
		const { onScrollBeginning, onScrollEnding } = this.props;

		const { scrollTop, scrollHeight, offsetHeight } = this.scrollArea;

		if (scrollTop < TRIGGEROFFSET && onScrollBeginning) {
			onScrollBeginning();
		}

		const scrollOffset = scrollHeight - (scrollTop + offsetHeight);

		if (scrollOffset > TRIGGEROFFSET) {
			return;
		}

		if (onScrollEnding) {
			onScrollEnding();
		}
	}

	handleRef(ref: any) {
		this.scrollArea = ref;
	}

	render() {
		const { onScrollEnding, onScrollBeginning, ...rest } = this.props;

		return (
			<ScrollArea
				data-test="infinitelist__scrollarea"
				{...rest}
				ref={this.handleRef}
				onScroll={this.handleScroll}
			/>
		);
	}
}
