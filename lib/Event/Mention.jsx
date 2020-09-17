/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash'
import React from 'react'
import * as helpers from '../services/helpers'

// Adds attributes to the spans that wrap matched tokens
// (usernames, groups, hashtags etc) in messages.
const prefixRE = new RegExp(`^(${helpers.TAG_MATCH_REGEXP_PREFIX})`)

export const highlightTags = (element, readBy, username, groups) => {
	const text = element.innerText || element.textContent
	if (text.charAt(0) === '#') {
		return
	}

	const trimmed = text.replace(prefixRE, '').toLowerCase()
	const group = groups && groups[trimmed]

	if (group && group.isMine) {
		element.className += ' rendition-tag--personal'
	} else if (trimmed === username) {
		element.className += ' rendition-tag--personal'
	}

	if (text.charAt(0) === '!') {
		element.className += ' rendition-tag--alert'
	}

	if (!readBy.length) {
		return
	}

	if (group) {
		const readByCount = _.intersection(readBy, group.users).length
		element.setAttribute('data-read-by-count', readByCount)
		element.className += ' rendition-tag--read-by'
	}

	if (_.includes(readBy, `user-${trimmed}`)) {
		element.className += ' rendition-tag--read'
	}
}

const Mention = ({
	readBy = '', slug, groups, ...rest
}) => {
	const ref = React.useRef(null)

	React.useEffect(() => {
		if (ref.current) {
			highlightTags(
				ref.current,

				// Rehype-react serializes array, we need to deserialize it.
				// See: https://github.com/rehypejs/rehype-react/issues/23
				// See: https://github.com/syntax-tree/hast-to-hyperscript/issues/18
				readBy ? readBy.split(' ') : [],
				slug.slice(5),
				groups
			)
		}
	}, [
		ref.current,
		readBy,
		slug,
		groups
	])

	return (
		<span {...rest} ref={ref} className="rendition-tag--hl" />
	)
}

export default Mention
