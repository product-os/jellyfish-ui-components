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
			// This.queryForMoreIfNecessary()
		}
	}

	componentDidUpdate () {
		const {
			fillMaxArea
		} = this.props
		if (fillMaxArea) {
			// This.queryForMoreIfNecessary()
		}
	}

	isRowLoaded ({
		index
	}) {
		return Boolean(this.props.list[index])
	}

	rowRenderer ({
		index, key, isScrolling, parent, style
	}) {
		const {
			list, component: Component
		} = this.props

		const item = list[index]

		return (
			<CellMeasurer
				key={key}
				cache={this.cache}
				columnIndex={0}
				parent={parent}
				rowIndex={index}
			>
				{({
					measure, registerChild
				}) => {
					return (
						<Component
							item={item}
							registerChild={registerChild}
						/>
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
			onScrollBeginning,
			onScrollEnding,
			processing
		} = this.props
		if (processing) {
			return
		}
		const {
			clientHeight,
			scrollHeight
		} = this.scrollArea
		const noScrollBar = clientHeight === scrollHeight
		if (noScrollBar) {
			if (onScrollBeginning) {
				onScrollBeginning()
			}
			if (onScrollEnding) {
				onScrollEnding()
			}
		}
	}

	loadMoreRows () {
		const {
			processing,
			onScrollBeginning,
			onScrollEnding,
			triggerOffset
		} = this.props
		if (processing) {
			return
		}
		const {
			scrollTop,
			scrollHeight,
			offsetHeight
		} = this.scrollArea

		if (scrollTop < triggerOffset && onScrollBeginning) {
			onScrollBeginning()
		}

		const scrollOffset = scrollHeight - (scrollTop + offsetHeight)

		if (scrollOffset > triggerOffset) {
			return
		}

		if (onScrollEnding) {
			onScrollEnding()
		}
	}

	render () {
		const {
			list
		} = this.props

		return (
			<InfiniteLoader
				isRowLoaded={this.isRowLoaded}
				loadMoreRows={this.loadMoreRows}
				rowCount={list.length}
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
										rowCount={list.length}
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
		)
	}
}

InfiniteList.defaultProps = {
	triggerOffset: 200
}
