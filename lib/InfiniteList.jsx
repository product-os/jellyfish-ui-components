/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	List,
	AutoSizer,
	CellMeasurer,
	CellMeasurerCache,
	InfiniteLoader
} from 'react-virtualized'
import {
	Box
} from 'rendition'

export class InfiniteList extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.loadMoreRows = this.loadMoreRows.bind(this)
		this.queryForMoreIfNecessary = this.queryForMoreIfNecessary.bind(this)
		this.rowRenderer = this.rowRenderer.bind(this)
		this.isRowLoaded = this.isRowLoaded.bind(this)

		this.cache = new CellMeasurerCache({
			defaultHeight: 100,
			fixedWidth: true
		})
	}

	componentDidMount () {
		const {
			fillMaxArea
		} = this.props
		if (fillMaxArea) {
			this.queryForMoreIfNecessary()
		}
	}

	componentDidUpdate () {
		const {
			fillMaxArea
		} = this.props
		if (fillMaxArea) {
			this.queryForMoreIfNecessary()
		}
	}

	isRowLoaded ({
		index
	}) {
		return Boolean(this.props.children[index])
	}

	rowRenderer ({
		index, key, isScrolling, parent, style
	}) {
		const {
			children, component: Component
		} = this.props

		const item = children[index]

		if (!item) {
			return null
		}

		return (
			<CellMeasurer
				key={key}
				cache={this.cache}
				columnIndex={0}
				parent={parent}
				rowIndex={index}
			>
				{({
					registerChild
				}) => {
					return (
						<div
							className="cellMeasurerChild"
							style={style}
						>
							{index}{item}
						</div>
					)
				}}
			</CellMeasurer>
		)
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
	queryForMoreIfNecessary () {
		const {
			processing
		} = this.props
		if (processing) {
			return
		}

		console.log('queryForMoreIfNecessary')

		// Const {
		// 	clientHeight,
		// 	scrollHeight
		// } = this.scrollArea
		// const noScrollBar = clientHeight === scrollHeight
		// if (noScrollBar) {
		// 	if (onScrollBeginning) {
		// 		onScrollBeginning()
		// 	}
		// 	if (onScrollEnding) {
		// 		onScrollEnding()
		// 	}
		// }
	}

	loadMoreRows ({
		startIndex, stopIndex
	}) {
		const {
			processing,
			onScrollBeginning,
			onScrollEnding,
			triggerOffset
		} = this.props
		if (processing) {
			return
		}

		console.log('loadMoreRows', startIndex, stopIndex)

		// Const {
		// 	scrollTop,
		// 	scrollHeight,
		// 	offsetHeight
		// } = this.scrollArea

		// if (scrollTop < triggerOffset && onScrollBeginning) {
		// 	onScrollBeginning()
		// }

		// const scrollOffset = scrollHeight - (scrollTop + offsetHeight)

		// if (scrollOffset > triggerOffset) {
		// 	return
		// }

		// if (onScrollEnding) {
		// 	onScrollEnding()
		// }
	}

	render () {
		const {
			children
		} = this.props
		console.log(this.props)
		console.log('children', children)

		return (
			<Box bg={this.props.bg} style={this.props.style}>
				<InfiniteLoader
					isRowLoaded={this.isRowLoaded}
					loadMoreRows={this.loadMoreRows}
					rowCount={children.length}
				>
					{({
						onRowsRendered, registerChild
					}) => {
						return (
							<AutoSizer>
								{({
									height, width
								}) => {
									return (
										<List
											ref={registerChild}
											onRowsRendered={onRowsRendered}
											height={height}
											width={width}
											rowCount={children.length}
											rowRenderer={this.rowRenderer}
											rowHeight={this.cache.rowHeight}
										/>
									)
								}
								}
							</AutoSizer>
						)
					}}
				</InfiniteLoader>
			</Box>
		)
	}
}

InfiniteList.defaultProps = {
	triggerOffset: 200
}
