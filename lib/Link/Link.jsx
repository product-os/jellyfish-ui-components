/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash'
import path from 'path'
import React from 'react'
import {
	Link as RenditionLink
} from 'rendition'
import {
	isRelativeUrl,
	isLocalUrl,
	toRelativeUrl
} from '../services/helpers'

export const getLinkProps = (href) => {
	if (isRelativeUrl(href)) {
		return {
			append: href.replace(/^\//, '')
		}
	}
	return (isLocalUrl(href))
		? {
			append: toRelativeUrl(href).replace(/^\//, '')
		}
		: {
			to: href,
			blank: true
		}
}

export class Link extends React.Component {
	constructor (props) {
		super(props)

		this.navigate = this.navigate.bind(this)
	}

	makeUrl () {
		const {
			append,
			location,
			to
		} = this.props

		if (to) {
			return to
		}

		if (append) {
			return path.join(location.pathname, append)
		}

		return ''
	}

	navigate (event) {
		// If control or meta keys are pressed, then use default browser behaviour
		if (event.ctrlKey || event.metaKey) {
			return true
		}

		const {
			blank,
			history
		} = this.props

		event.stopPropagation()

		if (blank) {
			return true
		}

		event.preventDefault()

		const url = this.makeUrl()

		history.push(url)
		return false
	}

	render () {
		const props = _.omit(this.props, [
			'match',
			'location',
			'history',
			'to',
			'append'
		])

		const url = this.makeUrl()

		return (
			<RenditionLink
				{...props}
				href={url}
				onClick={this.navigate}
			/>
		)
	}
}