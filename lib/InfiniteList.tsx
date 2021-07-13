/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { Box } from 'rendition';
import styled from 'styled-components';

const ScrollArea = styled(Box)`
	overflow-y: auto;
	height: 100%;
`;

export class InfiniteList extends React.Component<any> {
	scrollArea: any;

	constructor(props: any, context: any) {
		super(props, context);

		this.handleRef = this.handleRef.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.queryForMoreIfNecessary = this.queryForMoreIfNecessary.bind(this);
	}

	componentDidMount() {
		const { fillMaxArea } = this.props;
		if (fillMaxArea) {
			this.queryForMoreIfNecessary();
		}
	}

	componentDidUpdate() {
		const { fillMaxArea } = this.props;
		if (fillMaxArea) {
			this.queryForMoreIfNecessary();
		}
	}

	// QueryForMoreIfNecessary runs a query if the component
	// is not a scrollable container. This is to account
	// for a situation with the timeline component
	// where only one or two messages exist alongside
	// a page of whispers. In this situation, if a user
	// toggles off the whispers, we need to trigger another
	// query. If we don't do this, there may be other
	// messages further up the timeline that the user
	// cannot load because they cannot scroll
	queryForMoreIfNecessary() {
		const { onScrollBeginning, onScrollEnding, processing } = this.props;
		if (processing) {
			return;
		}
		const { clientHeight, scrollHeight } = this.scrollArea;
		const noScrollBar = clientHeight === scrollHeight;
		if (noScrollBar) {
			if (onScrollBeginning) {
				onScrollBeginning();
			}
			if (onScrollEnding) {
				onScrollEnding();
			}
		}
	}

	handleScroll() {
		const { processing, onScrollBeginning, onScrollEnding, triggerOffset } =
			this.props;
		if (processing) {
			return;
		}
		const { scrollTop, scrollHeight, offsetHeight } = this.scrollArea;

		if (scrollTop < triggerOffset && onScrollBeginning) {
			onScrollBeginning();
		}

		const scrollOffset = scrollHeight - (scrollTop + offsetHeight);

		if (scrollOffset > triggerOffset) {
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

(InfiniteList as any).defaultProps = {
	triggerOffset: 200,
};
