/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import ContextMenu from '../../ContextMenu'
import {
	ActionLink
} from '../../shame/ActionLink'

const Menu = ({
	showMenu,
	menuOptions,
	onToggleMenu,
	onCopyJSON
}) => {
	if (!showMenu) {
		return null
	}

	return (
		<ContextMenu position="bottom" onClose={onToggleMenu}>
			<ActionLink onClick={onCopyJSON} tooltip={{
				text: 'JSON copied!',
				trigger: 'click'
			}}>
						Copy as JSON
			</ActionLink>
			{menuOptions}
		</ContextMenu>
	)
}

export default React.memo(Menu)
