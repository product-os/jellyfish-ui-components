import React from 'react'
import _ from 'lodash'
import {
	Box
} from 'rendition'
import {
	withSetup
} from '../SetupProvider'
import Icon from '../shame/Icon'
import Event from '../Event'
import {
	MESSAGE,
	WHISPER,
	SUMMARY
} from '../constants'

const isNotMessage = (type) => {
	return !_.includes([ MESSAGE, WHISPER, SUMMARY ], type)
}

const TimelineEvent = ({
	event,
	hideWhispers,
	sortedEvents,
	uploadingFiles,
	messagesOnly,
	index,
	registerChild,
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
			/>
		</Box>
	)
}

export default withSetup(TimelineEvent)
