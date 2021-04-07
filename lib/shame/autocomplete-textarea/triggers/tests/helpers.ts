/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

const getComponentFromTrigger = async (trigger: any, tag: any, text: any) => {
	const [matching] = await trigger.dataProvider(`${tag}${text}`);
	const div = trigger.component({
		entity: matching,
	});
	return div;
};

const getOutputFromTrigger = async (
	trigger: any,
	tag: string,
	text: string,
) => {
	const [matching] = await trigger.dataProvider(`${tag}${text}`);
	return trigger.output(matching);
};

export { getComponentFromTrigger, getOutputFromTrigger };
