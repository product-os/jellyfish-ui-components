/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash'
import React from 'react'
import queryString from 'query-string'
import {
	v4 as uuid
} from 'uuid'
import * as helpers from '../services/helpers'
import Column from '../shame/Column'
import MessageInput, {
	messageSymbolRE
} from './MessageInput'
import {
	withSetup
} from '../SetupProvider'
import Header from './Header'
import EventWrapper from './EventWrapper'
import TypingNotice from './TypingNotice'
import {
	addNotification
} from '../services/notifications'
import EventsContainer from '../EventsContainer'
import {
	InfiniteList
} from '../InfiniteList'

// TODO: Abstract this constant to Redux and allow setting page size in user settings.
const PAGE_SIZE = 40

export {
	MessageInput
}

/*
 * This message text is used when uploading a file so that syncing can be done
 * effectively without have to sync the entire file
 */
export const HIDDEN_ANCHOR = '#jellyfish-hidden'
export const FILE_PROXY_MESSAGE = `[](${HIDDEN_ANCHOR})A file has been uploaded using Jellyfish:`

const getSendCommand = (user) => {
	return _.get(user.data, [ 'profile', 'sendCommand' ], 'shift+enter')
}

class Timeline extends React.Component {
	constructor (props) {
		super(props)

		// TODO: after this refactor go through state and props and remove unused
		this.state = {
			hideWhispers: false,
			messageSymbol: false,
			messagesOnly: true,
			pendingMessages: [],
			showNewCardModal: false,
			uploadingFiles: [],
			eventSkip: PAGE_SIZE,
			reachedBeginningOfTimeline: this.props.tail < PAGE_SIZE,
			loadingNextPage: false
		}

		this.timelineStart = React.createRef()
		this.timelineEnd = React.createRef()
		this.scrollToTop = this.scrollToTop.bind(this)
		this.scrollToBottom = this.scrollToBottom.bind(this)
		this.scrollToEvent = this.scrollToEvent.bind(this)
		this.retrieveFullTimelime = this.retrieveFullTimeline.bind(this)
		this.addMessage = this.addMessage.bind(this)
		this.handleCardVisible = this.handleCardVisible.bind(this)
		this.handleFileChange = this.handleFileChange.bind(this)
		this.handleEventToggle = this.handleEventToggle.bind(this)
		this.handleJumpToTop = this.handleJumpToTop.bind(this)
		this.handleWhisperToggle = this.handleWhisperToggle.bind(this)
		this.loadMoreEvents = this.loadMoreEvents.bind(this)
		this.loadNext = this.loadNext.bind(this)
		this.getOptions = this.getOptions.bind(this)

		this.signalTyping = _.throttle(() => {
			this.props.signalTyping(this.props.card.id)
		}, 1500)

		this.preserveMessage = (newMessage) => {
			this.props.setTimelineMessage(this.props.card.id, newMessage)
		}
	}

	async componentDidMount () {
		// When component mounts call scrollToEvent, calling this without arguments
		// will parse the window url looking for an event identifier
		this.scrollToEvent()
	}

	componentDidUpdate (prevProps) {
		const {
			pendingMessages,
			loadingNextPage
		} = this.state
		const {
			tail
		} = this.props

		const newMessages = _.differenceBy(tail, prevProps.tail, 'id')

		// Stop loading state if are loadingNextPage and have newMessages
		if (newMessages.length && loadingNextPage) {
			// TODO: Confirm the the InfiniteList >> InfiniteScroll component already debouces loading triggers
			// If so remove this logic
			// If not clean up this logic
			// console.log('turn off loadingNextPage (DISABLED)')
			this.setState({
				loadingNextPage: false
			})
		}

		// If we have newMessages and pendingMessages
		if (newMessages.length && pendingMessages.length) {
			const prevPendingMessages = pendingMessages

			// Remove the messages in the newMessage array from the
			// pendingMessages and set the updated pendingMessages state
			// It probably means the messages user posted are comming in
			this.setState({
				pendingMessages: _.pullAllBy(pendingMessages, newMessages, 'slug')
			}, () => {
				console.log('should call scroll to bottom')

				// If we removed messages AND are at the bottom of the timeline,
				// scroll to bottom to keep the new message in view
				// if (prevPendingMessages.length < this.state.pendingMessages.length) {
				// 	this.scrollToBottom()
				// }
			})
		}
	}

	// eslint-disable-next-line class-methods-use-this
	scrollToTop () {
		console.log('scrolling to top (disabled)')
	}

	// eslint-disable-next-line class-methods-use-this
	scrollToBottom () {
		console.log('scrolling to bottom (disabled)')
	}

	// eslint-disable-next-line class-methods-use-this
	scrollToEvent (eventId) {
		const {
			event: queryEventId
		} = queryString.parse(window.location.search)

		const event = eventId || queryEventId

		if (!event) {
			return
		}

		console.log('scrolling to event (disabled)')
	}

	async handleJumpToTop () {
		console.log('jump to top')
		await this.retrieveFullTimeline()
	}

	async loadNext () {
		const {
			loadingNextPage,
			reachedBeginningOfTimeline
		} = this.state

		if (loadingNextPage) {
			return
		}

		// Set the state to loading
		this.setState({
			loadingNextPage: true
		}, async () => {
			// TODO: remove this loading state and use the infinite list loading indicator
			// TODO: check if the infinite loader rebounces loading
			await this.loadMoreEvents(this.getOptions(PAGE_SIZE))
		})
	}

	async retrieveFullTimeline (callback) {
		// TODO: Confirm this still works...
		// Set links options to empty object to remove default query options
		const options = {
			links: {}
		}
		await this.loadMoreEvents(options)
	}

	handleEventToggle () {
		this.setState({
			messagesOnly: !this.state.messagesOnly
		})
	}

	handleWhisperToggle () {
		this.setState({
			hideWhispers: !this.state.hideWhispers
		})
	}

	handleFileChange (files, whisper) {
		// TODO: Confirm the uploadingFiles events still work as expected
		// TODO: Update this method to also call `loadMoreEvents` correctly
		// perhaps this method should call `addMessage` instead of duplicating logic...
		const type = whisper ? 'whisper' : 'message'
		if (!files || !files.length) {
			return
		}
		const file = _.first(files)
		const message = {
			target: this.props.card,
			tags: [],
			type,
			slug: `${type}-${uuid()}`,
			payload: {
				file,
				message: `${FILE_PROXY_MESSAGE} ${helpers.createPermaLink(this.props.card)}`
			}
		}

		this.setState({
			uploadingFiles: this.state.uploadingFiles.concat(message.slug)
		})

		this.props.sdk.event.create(message)
			.then(() => {
				this.props.analytics.track('element.create', {
					element: {
						type
					}
				})
			})
			.catch((error) => {
				addNotification('danger', error.message || error)
			})
			.finally(() => {
				this.setState({
					uploadingFiles: _.without(this.state.uploadingFiles, message.slug)
				})
			})
	}

	handleCardVisible (card) {
		this.props.sdk.card.markAsRead(this.props.user.slug, card, _.map(_.filter(this.props.groups, 'isMine'), 'name'))
			.catch((error) => {
				console.error(error)
			})
	}

	addMessage (newMessage, whisper) {
		const trimmedMessage = newMessage.trim()

		if (!trimmedMessage) {
			return
		}

		this.props.setTimelineMessage(this.props.card.id, '')

		const {
			mentionsUser,
			alertsUser,
			mentionsGroup,
			alertsGroup,
			tags
		} = helpers.getMessageMetaData(trimmedMessage)

		const message = {
			target: this.props.card,
			type: whisper ? 'whisper' : 'message',
			slug: `${whisper ? 'whisper' : 'message'}-${uuid()}`,
			tags,
			payload: {
				mentionsUser,
				alertsUser,
				mentionsGroup,
				alertsGroup,
				message: helpers.replaceEmoji(trimmedMessage.replace(messageSymbolRE, ''))
			}
		}

		// Synthesize the event card and add it to the pending messages so it can be
		// rendered in advance of the API request completing it
		this.setState({
			pendingMessages: this.state.pendingMessages.concat({
				pending: true,
				type: message.type,
				tags,
				slug: message.slug,
				data: {
					actor: this.props.user.id,
					payload: message.payload,
					target: this.props.card.id
				}
			})
		}, async () => {
			this.scrollToBottom()

			try {
				// Update the schema so we're listening to the correct items
				// To get the correct new page size, we either need the pendingMessages count
				// or 1. If pendingMessages is 0 it means the message has already arrived in
				const pageSize = this.state.pendingMessages.length ? 0 : 1
				const options = this.getOptions(pageSize)

				const broadcast = true

				// Note: Don't await this method, it won't resolve without triggering an update
				this.loadMoreEvents(options, broadcast)

				// When the message has been added to the pendingMessage state.
				// Fire the sdk method to create the message in the backend
				await this.props.sdk.event.create(message)

				// After creating an element, track the create event
				this.props.analytics.track('element.create', {
					element: {
						type: message.type
					}
				})
			} catch (error) {
				addNotification('danger', error.message || error)
			}
		})
	}

	getOptions (pageSize = 0) {
		const {
			pendingMessages
		} = this.state

		const {
			tail
		} = this.props

		const limit = tail.length + pendingMessages.length + pageSize

		return {
			links: {
				'has attached element': {
					sortBy: 'created_at',
					sortDir: 'desc',
					limit
				}
			}
		}
	}

	async loadMoreEvents (queryOptions = this.getOptions(), broadcast = false) {
		// Start the query to load more events
		const {
			card,
			loadMoreChannelData
		} = this.props

		const target = card.slug
		const query = {
			type: 'object',
			properties: {
				id: {
					const: card.id
				}
			},
			$$links: {
				'has attached element': {
					type: 'object'
				}
			}
		}

		await loadMoreChannelData({
			target, query, queryOptions, broadcast
		})

		// TODO: implement end of list logic
		// Because we dont't know how many pages / cards we have in total.
		// We can use the return value to determine if we reached the end of the timeline
		// Note: Shouldn't use the return value to set the new timeline cards
		// because this is way slower than just letting the stream update.
		// TODO: remove this logic when the backend returns the full count of cards
	}

	render () {
		const {
			user,
			card,
			getActor,
			enableAutocomplete,
			eventMenuOptions,
			sdk,
			types,
			groups,
			allowWhispers,
			usersTyping,
			timelineMessage,
			wide,
			headerOptions,
			getActorHref,
			tail
		} = this.props
		const {
			messagesOnly,
			pendingMessages,
			hideWhispers,
			loadingNextPage,
			uploadingFiles,
			reachedBeginningOfTimeline
		} = this.state

		// TODO: Problem:
		// 1. timeline: 40 messages
		// 2. create message: 40 messages + 1 pending message = 41
		// 3. setSchema gets called in loadMoreChannelData: 41 messages + 1 pending
		// 4. stream recieves created message: 41 message + 0 pending
		// So what happens is we set the schema
		// and it returns the results quicker than
		// the new message is streamed to the client
		// meaning the first get an extra "older message"
		// before we get the new message through the stream

		// TODO: Problem 2:
		// 2 browsers side by side,
		// - B1 on page 2 (80 messages)
		// - B2 on page 1 (40 messages)
		// 1. B1 create a message and updates it's schema to 81 messages
		// 2. B2 will recieve the broadcasted setSchema with the limit set
		// 		to 81 instead of the expected 41.
		// 		See: https://github.com/product-os/jellyfish-core/blob/18c1799eee418c41d33c2f8846c0a6d3355ee81e/lib/backend/postgres/streams.js#L338-L341

		// We should join the tail messages and pendingMessages in a single array
		// Due to a bug in syncing, sometimes there can be duplicate cards in events
		const sortedEvents = _.uniqBy(_.sortBy([ ...tail, ...pendingMessages ], (event) => {
			return _.get(event, [ 'data', 'timestamp' ]) || event.created_at
		}), 'slug')

		const sendCommand = getSendCommand(user)

		const isMirrored = !_.isEmpty(_.get(card, [ 'data', 'mirrors' ]))

		const eventProps = {
			types,
			groups,
			enableAutocomplete,
			sendCommand,
			onCardVisible: this.handleCardVisible,
			user,
			threadIsMirrored: isMirrored,
			menuOptions: eventMenuOptions,
			getActorHref,
			targetCard: card
		}

		const events = _.reverse(sortedEvents.map((event, index) => {
			return (
				<EventWrapper
					{ ...eventProps }
					key={event.slug}
					user={user}
					hideWhispers={hideWhispers}
					sortedEvents={sortedEvents}
					uploadingFiles={uploadingFiles}
					messagesOnly={messagesOnly}
					event={event}
					index={index}
				/>
			)
		}))

		return (
			<Column>
				<Header
					headerOptions={headerOptions}
					hideWhispers={hideWhispers}
					messagesOnly={messagesOnly}
					sortedEvents={sortedEvents}
					handleJumpToTop={this.handleJumpToTop}
					handleWhisperToggle={this.handleWhisperToggle}
					handleEventToggle={this.handleEventToggle}
					card={card}
					getActor={getActor}
				/>

				{/* TODO: EventsContainer can be merged with the InfiniteList component  */}
				<EventsContainer>
					<InfiniteList
						up
						next={this.loadNext}
					>
						{ events }
					</InfiniteList>
				</EventsContainer>

				<TypingNotice usersTyping={usersTyping} />

				<MessageInput
					enableAutocomplete={enableAutocomplete}
					sdk={sdk}
					types={types}
					user={user}
					wide={wide}
					style={{
						borderTop: '1px solid #eee'
					}}
					allowWhispers={allowWhispers}
					sendCommand={sendCommand}
					value={timelineMessage}
					signalTyping={this.signalTyping}
					preserveMessage={this.preserveMessage}
					onSubmit={this.addMessage}
					onFileChange={this.handleFileChange}
				/>
			</Column>
		)
	}
}

export default withSetup(Timeline)
