/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as Bluebird from 'bluebird'
import _ from 'lodash'
import React from 'react'
import queryString from 'query-string'
import {
	Box
} from 'rendition'
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
import Loading from './Loading'
import TimelineStart from './TimelineStart'
import EventsList from './EventsList'
import PendingMessages from './PendingMessages'
import TypingNotice from './TypingNotice'
import {
	addNotification
} from '../services/notifications'
import {
	UPDATE,
	CREATE
} from '../constants'
import EventsContainer from '../EventsContainer'
import {
	InfiniteList
} from '../InfiniteList'

const PAGE_SIZE = 20

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

const getFreshPendingMessages = (tail, pendingMessages) => {
	return _.filter(pendingMessages, (pending) => {
		return !_.find(tail, [ 'slug', pending.slug ])
	})
}

class Timeline extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			hideWhispers: false,
			messageSymbol: false,
			messagesOnly: true,
			pendingMessages: [],
			showNewCardModal: false,
			uploadingFiles: [],
			eventSkip: PAGE_SIZE,
			reachedBeginningOfTimeline: this.props.tail < PAGE_SIZE,
			loadingMoreEvents: false,
			ready: false
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
		const {
			event
		} = queryString.parse(window.location.search)

		if (event) {
			this.scrollToEvent(event)
		} else {
			console.log('scrolling to bottom')
			this.scrollToBottom()
		}

		this.setState({
			ready: true
		})
	}

	componentDidUpdate (prevProps) {
		const {
			pendingMessages,
			loadingMoreEvents
		} = this.state
		const {
			tail
		} = this.props

		const newMessages = _.differenceBy(tail, prevProps.tail, 'id')

		// Stop loading state if are loadingMoreEvents and have newMessages
		if (newMessages.length && loadingMoreEvents) {
			console.log('turn off loadingMoreEvents', newMessages)
			this.setState({
				loadingMoreEvents: false
			})
		}

		// If we have newMessages and pendingMessages
		if (newMessages.length && pendingMessages.length) {
			// Remove the messages in the newMessage array from the
			// pendingMessages and set the updated pendingMessages state
			this.setState({
				pendingMessages: _.pullAllBy(pendingMessages, newMessages, 'slug')
			})
			console.log('remove new message from pending state callback')
		}
	}

	scrollToEvent (eventId) {
		console.log('scroll to event')
	}

	async loadNext () {
		await this.loadMoreEvents()
	}

	async handleJumpToTop () {
		console.log('jump to top')
		await this.retrieveFullTimeline()
	}

	async retrieveFullTimeline (callback) {
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
			await this.loadMoreEvents({
				links: {
					'has attached element': {
						sortBy: 'created_at',
						sortDir: 'desc',
						limit: this.props.tail.length + this.state.pendingMessages.length
					}
				}
			})
		})

		console.log('before message create')
		this.props.sdk.event.create(message)
			.then(() => {
				console.log('message create callback')
				this.props.analytics.track('element.create', {
					element: {
						type: message.type
					}
				})
			})
			.catch((error) => {
				addNotification('danger', error.message || error)
			})
	}

	scrollToTop () {
		if (this.timelineStart.current) {
			this.timelineStart.current.scrollIntoView({
				behaviour: 'smooth'
			})
		}
	}

	scrollToBottom () {
		this.timelineEnd.current.scrollIntoView()
	}

	getOptions () {
		return {
			links: {
				'has attached element': {
					sortBy: 'created_at',
					sortDir: 'desc',
					limit: PAGE_SIZE * 3,
					skip: this.props.tail.length
				}
			}
		}
	}

	async loadMoreEvents (queryOptions = this.getOptions()) {
		const {
			loadingMoreEvents,
			reachedBeginningOfTimeline
		} = this.state

		// Don't load more events if we're already loading
		// Of if we reached the beginning of the timeline
		// if (loadingMoreEvents || reachedBeginningOfTimeline) {
		if (loadingMoreEvents) {
			return
		}

		// Set the state to loading
		this.setState({
			loadingMoreEvents: true
		}, async () => {
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

			console.log('call loadMoreChannelData')

			const [ result ] = await loadMoreChannelData({
				target, query, queryOptions
			})

			// Because we dont't know how many pages / cards we have in total.
			// We can use the return value to determine if we reached the end of the timeline
			// Note: Shouldn't use the return value to set the new timeline cards
			// because this is way slower than just letting the stream update.
			// TODO: remove this logic when the backend returns the full count of cards
			const resultNewMessages = _.get(result, [ 'links', 'has attached element' ], [])

			if (resultNewMessages.length === 0) {
				this.setState({
					reachedBeginningOfTimeline: true,
					loadingMoreEvents: false
				})
			}
		})
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
			loadingMoreEvents,
			uploadingFiles,
			reachedBeginningOfTimeline
		} = this.state

		// Due to a bug in syncing, sometimes there can be duplicate cards in events
		const sortedEvents = _.uniqBy(_.sortBy(tail, (event) => {
			return _.get(event, [ 'data', 'timestamp' ]) || event.created_at
		}), 'id')

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

		console.log('tail length', tail.length, 'sortedEvents', sortedEvents.length)

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

				<EventsContainer>
					{!sortedEvents && (<Box p={3}>
						<Loading />
					</Box>)}
					<InfiniteList
						up
						next={this.loadNext}
					>
						<div ref={this.timelineStart} />
						{ reachedBeginningOfTimeline && <TimelineStart />}
						{ loadingMoreEvents && <Loading />}
						<EventsList
							{ ...eventProps }
							user={user}
							hideWhispers={hideWhispers}
							sortedEvents={sortedEvents}
							uploadingFiles={uploadingFiles}
							messagesOnly={messagesOnly}
						/>
						<PendingMessages
							{ ...eventProps }
							pendingMessages={pendingMessages}
							sortedEvents={sortedEvents}
						/>
						<div ref={this.timelineEnd} />
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
