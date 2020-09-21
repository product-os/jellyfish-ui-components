/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	notifications
} from 'rendition'
import {
	v4 as uuid
} from 'uuid'

export const addNotification = (type, content, options = {}) => {
	const id = options.id || uuid()
	notifications.addNotification({
		id, type, content, container: 'bottom-left', ...options
	})
	return id
}

export const removeNotification = (id) => {
	notifications.removeNotification(id)
}
