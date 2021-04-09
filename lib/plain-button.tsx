/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { Button, ButtonProps } from 'rendition';

interface PlainButtonProps extends Omit<ButtonProps, 'plain' | 'p'> {}

export const PlainButton: React.FunctionComponent<PlainButtonProps> = (
	props,
) => {
	return <Button {...props} plain p={2} />;
};
