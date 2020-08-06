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
	UPDATE,
	CREATE
} from './constants'
import EventsContainer from '../EventsContainer'
import {
	InfiniteList
} from '../InfiniteList'

const PAGE_SIZE = 20

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
		this.handleScrollBeginning = this.handleScrollBeginning.bind(this)
		this.retrieveFullTimelime = this.retrieveFullTimeline.bind(this)
		this.addMessage = this.addMessage.bind(this)
		this.handleCardVisible = this.handleCardVisible.bind(this)
		this.handleFileChange = this.handleFileChange.bind(this)
		this.handleEventToggle = this.handleEventToggle.bind(this)
		this.handleJumpToTop = this.handleJumpToTop.bind(this)
		this.handleWhisperToggle = this.handleWhisperToggle.bind(this)
		this.loadMoreEvents = this.loadMoreEvents.bind(this)

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
			// Timeout required to ensure the timeline has loaded before we scroll to the bottom
			await Bluebird.delay(2000)
			this.scrollToBottom()
			await Bluebird.delay(500)
			this.setState({
				ready: true
			})
		}
	}

	componentDidUpdate (prevProps) {
		const {
			pendingMessages
		} = this.state
		const {
			tail
		} = this.props

		const newMessages = tail.length > prevProps.tail.length

		if (newMessages) {
			this.setState({
				pendingMessages: newMessages ? getFreshPendingMessages(tail, pendingMessages) : pendingMessages
			})
		}
	}

	scrollToEvent (eventId) {
		const {
			tail
		} = this.props
		const {
			reachedBeginningOfTimeline
		} = this.state
		const existing = _.find(tail, {
			id: eventId
		})
		if (existing) {
			const pureType = existing.type.split('@')[0]
			if (pureType === UPDATE || pureType === CREATE) {
				this.handleEventToggle()
			}
			const messageElement = document.getElementById(`event-${eventId}`)
			if (messageElement) {
				messageElement.scrollIntoView({
					behavior: 'smooth'
				})
			}
		} else if (!reachedBeginningOfTimeline) {
			this.retrieveFullTimeline(() => {
				this.scrollToEvent(eventId)
			})
		}
	}

	handleScrollBeginning () {
		return new Promise((resolve, reject) => {
			const {
				eventSkip
			} = this.state
			this.setState({
				loadingMoreEvents: true
			}, () => {
				return this.loadMoreEvents({
					limit: PAGE_SIZE,
					skip: eventSkip
				}).then((newEvents) => {
					const receivedNewEvents = newEvents.length > 0
					this.setState({
						eventSkip: receivedNewEvents ? eventSkip + PAGE_SIZE : eventSkip,
						loadingMoreEvents: false,
						reachedBeginningOfTimeline: !receivedNewEvents
					})
					resolve()
				}
				)
			})
		})
	}

	handleJumpToTop () {
		if (this.state.reachedBeginningOfTimeline) {
			this.scrollToTop()
		} else {
			this.retrieveFullTimeline(() => {
				this.scrollToTop()
			})
		}
	}

	retrieveFullTimeline (callback) {
		return this.loadMoreEvents()
			.then(() => {
				this.setState({
					reachedBeginningOfTimeline: true
				}, callback)
			})
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
				this.setState({
					uploadingFiles: _.without(this.state.uploadingFiles, message.slug)
				})

				this.props.analytics.track('element.create', {
					element: {
						type
					}
				})
			})
			.catch((error) => {
				this.props.addNotification('danger', error.message || error)
			})
	}

	handleCardVisible (card) {
		this.props.sdk.card.markAsRead(this.props.user.slug, card, _.map(_.filter(this.props.groups, 'isMine'), 'name'))
			.catch((error) => {
				console.error(error)
			})
	}

	addMessage (newMessage, whisper) {
		if (!newMessage) {
			return
		}
		this.props.setTimelineMessage(this.props.card.id, '')
		const {
			mentionsUser,
			alertsUser,
			mentionsGroup,
			alertsGroup,
			tags
		} = helpers.getMessageMetaData(newMessage)
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
				message: helpers.replaceEmoji(newMessage.replace(messageSymbolRE, ''))
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
		}, () => {
			this.scrollToBottom()
		})

		this.props.sdk.event.create(message)
			.then(() => {
				this.props.analytics.track('element.create', {
					element: {
						type: message.type
					}
				})
			})
			.catch((error) => {
				this.props.addNotification('danger', error.message || error)
			})
	}

	scrollToTop () {
		this.timelineStart.current.scrollIntoView({
			behaviour: 'smooth'
		})
	}

	scrollToBottom () {
		this.timelineEnd.current.scrollIntoView({
			behavior: 'smooth'
		})
	}

	loadMoreEvents (options = {}) {
		const {
			card,
			loadMoreChannelData
		} = this.props
		return loadMoreChannelData({
			target: card.slug,
			query: {
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
			},
			queryOptions: {
				links: {
					'has attached element': {
						sortBy: 'created_at',
						sortDir: 'desc',
						...options
					}
				}
			}
		})
	}

	render () {
		const {
			user,
			card,
			getActor,
			selectCard,
			getCard,
			enableAutocomplete,
			eventMenuOptions,
			addNotification,
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
			ready,
			uploadingFiles,
			reachedBeginningOfTimeline
		} = this.state

		// Due to a bug in syncing, sometimes there can be duplicate cards in events
		const sortedEvents = _.uniqBy(_.sortBy(tail, 'data.timestamp'), 'id')

		const sendCommand = getSendCommand(user)

		const isMirrored = !_.isEmpty(_.get(card, [ 'data', 'mirrors' ]))

		const eventProps = {
			types,
			groups,
			enableAutocomplete,
			sendCommand,
			onCardVisible: this.handleCardVisible,
			user,
			selectCard,
			getCard,
			actions: {
				addNotification
			},
			threadIsMirrored: isMirrored,
			menuOptions: eventMenuOptions,
			getActorHref
		}

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
						fillMaxArea
						onScrollBeginning={!reachedBeginningOfTimeline && ready && this.handleScrollBeginning}
						processing={loadingMoreEvents}
					>
						<div ref={this.timelineStart} />
						{ reachedBeginningOfTimeline && <TimelineStart />}
						{ loadingMoreEvents && <Loading />}
						<EventsList
							{ ...eventProps }
							user={user}
							getActor={getActor}
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
