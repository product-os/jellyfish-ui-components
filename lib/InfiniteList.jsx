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

		this.handleRef = this.handleRef.bind(this)
		this.handleScroll = this.handleScroll.bind(this)
	}

	handleScroll () {
		const {
			triggerOffset,
			up,
			down,
			next
		} = this.props
		const {
			scrollTop,
			scrollHeight,
			offsetHeight
		} = this.scrollArea

		if (scrollTop < triggerOffset && up) {
			return next()
		}

		const scrollOffset = scrollHeight - (scrollTop + offsetHeight)

		if (scrollOffset <= triggerOffset && down) {
			return next()
		}

		return null
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
