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
	parseMessage
} from './Message/Body'
import CardLoader from '../CardLoader'
import * as helpers from '../services/helpers'
import withCardUpdater from '../HOC/with-card-updater'
import {
	withSetup
} from '../SetupProvider'

import {
	UPDATE,
	LINK
} from '../constants'
import Update from './Update'
import LinkedCard from './LinkedCard'
import Message from './Message'

export {
	parseMessage
}

const EventWithActor = (props) => {
	const {
		card, user, selectCard, getCard, onCardVisible, targetCard
	} = props
	const typeBase = props.card.type.split('@')[0]
	return (
		<CardLoader
			id={helpers.getActorIdFromCard(props.card)}
			type="user"
			withLinks={[ 'is member of' ]}
			cardSelector={selectCard}
			getCard={getCard}
		>
			{(author) => {
				const actor = helpers.generateActorFromUserCard(author)
				if (typeBase === UPDATE) {
					return (
						<Update
							onCardVisible={onCardVisible}
							card={card}
							user={user}
							actor={actor}
						/>
					)
				}
				if (typeBase === LINK) {
					return (
						<LinkedCard
							actor={actor}
							card={card}
							targetCard={targetCard}
						/>
					)
				}
				return (
					<Message {...props} actor={actor} />
				)
			}}
		</CardLoader>
	)
}

export default compose(
	withSetup,
	withCardUpdater(true)
)(EventWithActor)
