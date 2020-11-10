/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import Space from '../shame/Space'

const ActorMessage = ({
	actor, suffix
}) => {
	if (actor && actor.name) {
		return (
			<span>
				<strong>{actor.name}</strong>
				<Space/>
				{ suffix }
			</span>
		)
	}
	return <span>{ suffix }</span>
}

export default React.memo(ActorMessage)
