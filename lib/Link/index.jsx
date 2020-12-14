/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import {
	withRouter
} from 'react-router-dom'
import {
	Link as InnerLink
} from './Link'
import {
	isRelativeUrl,
	isLocalUrl,
	toRelativeUrl
} from '../services/helpers'

export const Link = withRouter(InnerLink)

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

export const linkComponentOverride = ({
	blacklist
}) => {
	return ({
		href, ...rest
	}) => {
		if (href && _.some(blacklist, (url) => {
			return href.match(url)
		})) {
			return null
		}
		const linkProps = getLinkProps(href)
		return <Link {...rest} {...linkProps} />
	}
}
