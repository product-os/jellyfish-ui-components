/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, {
	useState
} from 'react'
import {
	Button,
	Flex
}	from 'rendition'
import copy from 'copy-to-clipboard'
import Icon from '../../../shame/Icon'
import UpdateContext from './UpdateContext'
import Menu from './Menu'

const Header = ({
	actor,
	card,
	menuOptions
}) => {
	const [ showMenu, updateShowMenu ] = useState(false)

	const onToggleMenu = () => {
		updateShowMenu(!showMenu)
	}

	const onCopyJSON = React.useCallback((event) => {
		event.preventDefault()
		event.stopPropagation()
		copy(JSON.stringify(card, null, 2))
	}, [ card ])

	return (
		<Flex
			justifyContent="space-between"
			mr={2}
		>
			<UpdateContext actor={actor} card={card} />
			<span>
				<Button
					className="event-card--actions"
					px={2}
					mr={-1}
					plain
					onClick={onToggleMenu}
					icon={<Icon name="ellipsis-v"/>}
				/>
				<Menu
					showMenu={showMenu}
					menuOptions={menuOptions}
					onToggleMenu={onToggleMenu}
					onCopyJSON={onCopyJSON}
				/>
			</span>
		</Flex>
	)
}

export default Header
