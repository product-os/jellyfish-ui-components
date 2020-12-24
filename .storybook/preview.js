/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	createGlobalStyle
} from 'styled-components'
import {
	Provider,
	Theme
} from 'rendition'

export const parameters = {
	actions: {
		argTypesRegex: '^on[A-Z].*'
	},
	controls: {
		expanded: true
	}
}

const GlobalStyle = createGlobalStyle([], {
	'*': {
		boxSizing: 'border-box'
	},
	body: {
		lineHeight: 1.5,
		margin: 0,
		fontFamily: Theme.font,
		webkitFontSmoothing: 'antialiased'
	}
})

const ThemeProvider = ({
	children
}) => {
	return (
		<React.Fragment>
			<GlobalStyle />
			<Provider theme={{}}>
				{children}
			</Provider>
		</React.Fragment>
	)
}

export const decorators = [
	(Story) => {
		return (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		)
	}
]
