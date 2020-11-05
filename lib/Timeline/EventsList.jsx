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
	MESSAGE,
	WHISPER,
	SUMMARY
} from '../constants'

const isNotMessage = (type) => {
	return !_.includes([ MESSAGE, WHISPER, SUMMARY ], type)
}

export default class EventsList extends React.Component {
	render () {
		const {
			hideWhispers,
			sortedEvents,
			uploadingFiles,
			messagesOnly,
			user,
			eventMenuOptions,
			...eventProps
		} = this.props

		if (sortedEvents && sortedEvents.length > 0) {
			return _.map(sortedEvents, (event, index) => {
				if (_.includes(uploadingFiles, event.slug)) {
					return (
						<Box key={event.slug} p={3}>
							<Icon name="cog" spin /><em>{' '}Uploading file...</em>
						</Box>
					)
				}

				const pureType = event.type.split('@')[0]

				if (messagesOnly && isNotMessage(pureType) && !event.name) {
					return null
				}
				if (hideWhispers && pureType === WHISPER) {
					return null
				}

				return (
					<Box
						data-test={event.id}
						key={event.id}>
						<Event
							{...eventProps}
							previousEvent={sortedEvents[index - 1]}
							nextEvent={sortedEvents[index + 1]}
							card={event}
							user={user}
						/>
					</Box>
				)
			})
		}
		return null
	}
}
