/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'

export const createTemplate = (Component) => {
	return (args) => {
		return <Component {...args} />
	}
}

export const createStory = (template, args) => {
	const res = template.bind({})
	res.args = args
	return res
}
