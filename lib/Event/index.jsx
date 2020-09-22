/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	compose
} from 'redux'
import {
	getMessage
} from './EventBody'
import CardLoader from '../CardLoader'
import * as helpers from '../services/helpers'
import withCardUpdater from '../HOC/with-card-updater'
import {
	withSetup
} from '../SetupProvider'

import {
	UPDATE
} from '../constants'
import Update from '../Update'
import Event from './Event'

export {
	getMessage
}

const EventWithActor = (props) => {
	const {
		card, user, selectCard, getCard, getActor, onCardVisible
	} = props
	const typeBase = props.card.type.split('@')[0]
	if (typeBase === UPDATE) {
		return (
			<Update
				onCardVisible={onCardVisible}
				card={card}
				user={user}
				getActor={getActor}
			/>
		)
	}
	return (
		<CardLoader
			id={helpers.getActorIdFromCard(props.card)}
			type="user"
			withLinks={[ 'is member of' ]}
			cardSelector={selectCard}
			getCard={getCard}
		>
			{(author) => {
				return (
					<Event {...props} actor={helpers.generateActorFromUserCard(author)} />
				)
			}}
		</CardLoader>
	)
}

export default compose(
	withSetup,
	withCardUpdater(true)
)(EventWithActor)
