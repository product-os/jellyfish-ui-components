/*
* Copyright (C) Balena.io - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited.
* Proprietary and confidential.
*/

import _ from 'lodash'
import {
	Box
} from 'rendition'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import Loading from './Timeline/Loading'

const ScrollArea = styled(Box) `
	padding: 8px 0px;
	flex: 1 1 0%;
	overflow: auto;
	display: flex;
	flex-direction: column-reverse;
`

export const InfiniteList = ({
	children,
	next
}) => {
	// Flatten and remove empty items in children array
	// We flatten because we dont' want to render the events array as a single component.
	// Instead we want to render each event as a InfiniteScroll child
	const items = _.flatten(_.compact(children))

	// The InfiniteScroll takes care of a lot of things
	// - It supports a loader component
	// - It will directly scroll to bottom
	// - It will query `next` as long as the `hasMore` prop is true
	// - It won't jump in scrollheight when new items get loaded
	//
	// Due to the `inverse` props and the double `column-reverse` styles
	// each event in the timeline should set a z-index. If not a list of components
	// with box-shadow will overlay with components below it, instead of the lower
	// component overlaying the box-shadow as expected
	// TODO: Allow the infiniteList component to switch coluns direction by
	// toggling inverse prop + flexDirection style
	// - Up: chat like list behaviour
	// - Down (default): regular list behaviour
	return (
		<ScrollArea id="scrollableDiv">
			<InfiniteScroll
				dataLength={items.length}
				next={next}
				style={{
					display: 'flex', flexDirection: 'column-reverse'
				}}
				inverse={true}
				hasMore={true}
				loader={<Loading />}
				scrollableTarget="scrollableDiv"
			>
				{items}
			</InfiniteScroll>
		</ScrollArea>
	)
}
