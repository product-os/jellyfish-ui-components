/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { notifications } from 'rendition';
// TS-TODO: export `NotificationOptions` from rendition main file
import { NotificationOptions } from 'rendition/dist/components/Notifications';
import { v4 as uuid } from 'uuid';

// TS-TODO: `notifications.addNotification` does not accept id
export const addNotification = (
	type: string,
	content: string,
	options: Partial<NotificationOptions> = {},
): string | number => {
	const id = options.id || uuid();
	notifications.addNotification({
		id,
		type,
		content,
		container: 'bottom-left',
		...options,
	});
	return id;
};

export const removeNotification = (id: string | number): void => {
	notifications.removeNotification(id);
};
