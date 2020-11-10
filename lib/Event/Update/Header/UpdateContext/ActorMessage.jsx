/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'

const ActorSuffix = () => {
	return <span>{ ' updated this '}</span>
}

const ActorMessage = ({
	actor
}) => {
	if (actor && actor.name) {
		return (
			<span>
				<strong>{actor.name}</strong>
				<ActorSuffix />
			</span>
		)
	}
	return <ActorSuffix />
}

export default React.memo(ActorMessage)
