/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import {
	Box
} from 'rendition'
import Icon from '../shame/Icon'
import Event from '../Event'
import {
	WHISPER
} from '../constants'
import {
	getTypeBase, isTimelineEvent
} from '../services/helpers'
import styled from 'styled-components'

const StyledEvent = styled(Box) `
	z-index: ${({
		index
	}) => { return index }};
`

const EventWrapper = ({
	event,
	index,
	hideWhispers,
	sortedEvents,
	uploadingFiles,
	messagesOnly,
	user,
	...eventProps
}) => {
	if (_.includes(uploadingFiles, event.slug)) {
		return (
			<Box key={event.slug} p={3}>
				<Icon name="cog" spin /><em>{' '}Uploading file...</em>
			</Box>
		)
	}

	const pureType = getTypeBase(event.type)

	if (messagesOnly && !isTimelineEvent(pureType) && !event.name) {
		return null
	}

	if (hideWhispers && pureType === WHISPER) {
		return null
	}

	return (
		<StyledEvent index={index}>
			<Event
				{...eventProps}
				id={event.slug}
				data-test={event.slug}
				key={event.slug}
				previousEvent={sortedEvents[index - 1]}
				nextEvent={sortedEvents[index + 1]}
				card={event}
				user={user}
			/>
		</StyledEvent>
	)
}

export default EventWrapper
