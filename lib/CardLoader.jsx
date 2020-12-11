/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	useSelector
} from 'react-redux'

export const CardLoaderContext = React.createContext(null)

export const CardLoader = ({
	id,
	type,
	withLinks,
	children
}) => {
	if (typeof children !== 'function') {
		throw new Error('CardLoader only accepts a function as a child')
	}
	const {
		getCard,
		selectCard
	} = React.useContext(CardLoaderContext)
	if (!getCard || !selectCard) {
		throw new Error(
			'CardLoaderContext not found. Did you forget to provide a CardLoaderContext.Provider in the element heirarchy?'
		)
	}
	const card = useSelector((state) => {
		return selectCard(id, type)(state)
	})
	React.useEffect(() => {
		if (!card) {
			getCard(id, type, withLinks)
		}
	}, [ id ])
	return children ? children(card) : null
}
