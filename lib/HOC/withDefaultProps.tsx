/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as React from 'react';

export const withDefaultProps = (defaultProps: any = {}) => {
	return (Component: any) => {
		return (props: any) => {
			return <Component {...defaultProps} {...props} />;
		};
	};
};