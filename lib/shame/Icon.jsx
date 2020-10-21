/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as _ from 'lodash'
import classnames from 'classnames'
import React from 'react'

export default function Icon (props) {
	const restProps = _.omit(props, [
		'brands',
		'regular',
		'name',
		'spin',
		'rotate'
	])

	// TODO: Replace the boolean props (brands, regular) with
	// a single enum prop so it's impossible to inadvertently
	// set two of them
	const className = classnames(`fa-${props.name}`, {
		fas: !props.brands && !props.regular,
		far: !props.brands && props.regular,
		fab: props.brands,
		'fa-spin': props.spin,
		[`fa-rotate-${props.rotate}`]: props.rotate
	})
	return (
		<i
			{...restProps}
			className={className}
		/>
	)
}
