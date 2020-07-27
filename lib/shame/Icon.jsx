/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as _ from 'lodash'
import React from 'react'

export default function Icon (props) {
	const restProps = _.omit(props, [
		'brands',
		'name',
		'spin',
		'rotate'
	])
	let className = `fa${props.brands ? 'b' : 's'} fa-${props.name}`
	if (props.spin) {
		className += ' fa-spin'
	}

	if (props.rotate) {
		className += ` fa-rotate-${props.rotate}`
	}

	return (
		<i
			{...restProps}
			className={className}
		/>
	)
}
