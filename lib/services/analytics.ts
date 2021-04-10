/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
import omit from 'lodash/omit';
import mixpanel, { Config as MixpanelConfig, Dict } from 'mixpanel-browser';

export default class Analytics {
	skip: boolean;
	isInitialized: boolean;

	constructor(config: MixpanelConfig & { token: string }) {
		this.isInitialized = false;
		this.skip = false;
		const token = config.token;
		if (token) {
			mixpanel.init(token, omit(config, 'token'));
		} else {
			console.warn('No token provided, skipping analytics setup');
			this.skip = true;
		}
		this.isInitialized = true;
	}

	track(event: string, metadata: Dict | undefined) {
		if (!this.isInitialized) {
			throw new Error('Analytics are not initialized');
		}
		if (this.skip) {
			return;
		}
		mixpanel.track(event, metadata);
	}

	identify(id: string) {
		if (!this.isInitialized) {
			throw new Error('Analytics are not initialized');
		}
		if (this.skip) {
			return;
		}
		mixpanel.identify(id);
	}
}