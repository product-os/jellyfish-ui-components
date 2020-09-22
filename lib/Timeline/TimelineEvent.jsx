import React from 'react'
import _ from 'lodash'
import {
	Box
} from 'rendition'
import {
	withSetup
} from '../SetupProvider'
import Icon from '../shame/Icon'
import Update from '../Update'
import Event from '../Event'
import {
	MESSAGE,
	WHISPER,
	UPDATE,
	SUMMARY
} from './constants'

const isNotMessage = (type) => {
	return !_.includes([ MESSAGE, WHISPER, SUMMARY ], type)
}

const TimelineEvent = ({
	event,
	getActor,
	hideWhispers,
	sortedEvents,
	uploadingFiles,
	handleCardVisible,
	messagesOnly,
	user,
	index,
	registerChild,
	eventMenuOptions,
	...eventProps
}) => {
	if (_.includes(uploadingFiles, event.slug)) {
		return (
			<Box ref={registerChild} key={event.slug} p={3}>
				<Icon name="cog" spin /><em>{' '}Uploading file...</em>
			</Box>
		)
	}

	const pureType = event.type.split('@')[0]

	if (messagesOnly && isNotMessage(pureType)) {
		return null
	}
	if (hideWhispers && pureType === WHISPER) {
		return null
	}

	if (pureType === UPDATE) {
		return (
			<Box
				data-test={event.id}
				key={event.id}
				ref={registerChild}
			>

				<Update
					onCardVisible={handleCardVisible}
					card={event}
					user={user}
					getActor={getActor}
				/>
			</Box>
		)
	}

	return (
		<Box
			data-test={event.id}
			key={event.id}
			ref={registerChild}
		>

			<Event
				{...eventProps}
				previousEvent={sortedEvents[index - 1]}
				nextEvent={sortedEvents[index + 1]}
				card={event}
				user={user}
			/>
		</Box>
	)
}

export default withSetup(TimelineEvent)
