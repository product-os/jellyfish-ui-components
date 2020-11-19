/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	withRouter
} from 'react-router-dom'
import {
	Link as InnerLink
} from './Link'

export {
	getLinkProps
} from './Link'

export const Link = withRouter(InnerLink)
