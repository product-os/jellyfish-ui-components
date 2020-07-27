/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	Box
} from 'rendition'
import styled from 'styled-components'

const ScrollArea = styled(Box) `
    overflow-y: auto;
    height: 100%;
`

export class InfiniteList extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.processing = false
		this.handleRef = this.handleRef.bind(this)
		this.handleScroll = this.handleScroll.bind(this)
		this.queryForMoreIfNecessary = this.queryForMoreIfNecessary.bind(this)
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

	async queryForMoreIfNecessary () {
		if (this.processing) {
			return
		}
		const {
			onScrollBeginning,
			onScrollEnding
		} = this.props
		const {
			clientHeight,
			scrollHeight
		} = this.scrollArea
		const noScrollBar = clientHeight === scrollHeight
		if (noScrollBar) {
			if (onScrollBeginning) {
				this.processing = true
				await onScrollBeginning()
				this.processing = false
			}
			if (onScrollEnding) {
				this.processing = true
				await onScrollEnding()
				this.processing = false
			}
		}
	}

	async handleScroll () {
		const {
			processing,
			onScrollBeginning,
			onScrollEnding,
			triggerOffset
		} = this.props
		if (this.processing || processing) {
			return
		}
		const {
			scrollTop,
			scrollHeight,
			offsetHeight
		} = this.scrollArea

		if (scrollTop < triggerOffset && onScrollBeginning) {
			this.processing = true
			await onScrollBeginning()
			this.processing = false
		}

		const scrollOffset = scrollHeight - (scrollTop + offsetHeight)

		if (scrollOffset > triggerOffset) {
			return
		}

		if (onScrollEnding) {
			this.processing = true
			await onScrollEnding()
			this.processing = false
		}
	}

	handleRef (ref) {
		this.scrollArea = ref
	}

	render () {
		const {
			onScrollEnding,
			onScrollBeginning,
			...rest
		} = this.props

		return (
			<ScrollArea
				{...rest}
				ref={this.handleRef}
				onScroll={this.handleScroll}
			/>
		)
	}
}

InfiniteList.defaultProps = {
	triggerOffset: 200
}
