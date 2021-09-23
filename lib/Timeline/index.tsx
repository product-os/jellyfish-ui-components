/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import * as Bluebird from 'bluebird';
import _ from 'lodash';
import React from 'react';
import queryString from 'query-string';
import { Box } from 'rendition';
import { v4 as uuid } from 'uuid';
import type { core } from '@balena/jellyfish-types';
import * as helpers from '../services/helpers';
import Column from '../shame/Column';
import MessageInput, { messageSymbolRE } from './MessageInput';
import { withSetup, Setup } from '../SetupProvider';
import Header from './Header';
import Loading from './Loading';
import TimelineStart from './TimelineStart';
import EventsList from './EventsList';
import PendingMessages from './PendingMessages';
import TypingNotice from './TypingNotice';
import { addNotification } from '../services/notifications';
import { UPDATE, CREATE } from '../constants';
import EventsContainer from '../EventsContainer';
import { InfiniteList } from '../InfiniteList';
import {
	Contract,
	TypeContract,
	UserContract,
} from '@balena/jellyfish-types/build/core';

const PAGE_SIZE = 20;

export { MessageInput };

/*
 * This message text is used when uploading a file so that syncing can be done
 * effectively without have to sync the entire file
 */
export const HIDDEN_ANCHOR = '#jellyfish-hidden';
export const FILE_PROXY_MESSAGE = `[](${HIDDEN_ANCHOR})A file has been uploaded using Jellyfish:`;

const getSendCommand = (user: core.UserContract) => {
	return _.get(user.data, ['profile', 'sendCommand'], 'shift+enter');
};

const getFreshPendingMessages = (tail: any[], pendingMessages: any[]) => {
	return _.filter(pendingMessages, (pending) => {
		return !_.find(tail, ['slug', pending.slug]);
	});
};

interface TimelineProps extends Setup {
	allowWhispers: boolean;
	card: Contract;
	enableAutocomplete?: boolean;
	eventMenuOptions: any;
	getActor: (idOrSlug: string) => Promise<any>;
	getActorHref: (actor: any) => string;
	groups: { [k: string]: any };
	headerOptions: any;
	loadMoreChannelData: (options: {
		target: string;
		query: any;
		queryOptions: any;
	}) => Promise<Contract[]>;
	notifications: any;
	setTimelineMessage: (id: string, message: string) => void;
	signalTyping: (id: string) => void;
	tail: Contract[];
	timelineMessage: string;
	types: TypeContract[];
	user: UserContract;
	usersTyping: any;
	wide: boolean;
}

class Timeline extends React.Component<TimelineProps, any> {
	timelineStart: any;
	timelineEnd: any;
	retrieveFullTimelime: any;
	signalTyping: any;
	preserveMessage: any;

	constructor(props: any) {
		super(props);
		this.state = {
			hideWhispers: false,
			messageSymbol: false,
			messagesOnly: true,
			pendingMessages: [],
			showNewCardModal: false,
			uploadingFiles: [],
			eventSkip: PAGE_SIZE,
			reachedBeginningOfTimeline: this.props.tail.length < PAGE_SIZE,
			loadingMoreEvents: false,
			ready: false,
		};

		this.timelineStart = React.createRef();
		this.timelineEnd = React.createRef();
		this.scrollToTop = this.scrollToTop.bind(this);
		this.scrollToBottom = this.scrollToBottom.bind(this);
		this.scrollToEvent = this.scrollToEvent.bind(this);
		this.handleScrollBeginning = this.handleScrollBeginning.bind(this);
		this.retrieveFullTimelime = this.retrieveFullTimeline.bind(this);
		this.addMessage = this.addMessage.bind(this);
		this.handleCardVisible = this.handleCardVisible.bind(this);
		this.handleFileChange = this.handleFileChange.bind(this);
		this.handleEventToggle = this.handleEventToggle.bind(this);
		this.handleJumpToTop = this.handleJumpToTop.bind(this);
		this.handleWhisperToggle = this.handleWhisperToggle.bind(this);
		this.loadMoreEvents = this.loadMoreEvents.bind(this);
		this.isAtBottomOfTimeline = this.isAtBottomOfTimeline.bind(this);

		this.signalTyping = _.throttle(() => {
			this.props.signalTyping(this.props.card.id);
		}, 1500);

		this.preserveMessage = (newMessage: any) => {
			this.props.setTimelineMessage(this.props.card.id, newMessage);
		};
	}

	async componentDidMount() {
		const { event } = queryString.parse(window.location.search);

		// Timeout required to ensure the timeline has loaded before we scroll to the bottom
		// @ts-ignore
		await Bluebird.delay(2000);
		if (event) {
			this.scrollToEvent(event);
		} else {
			this.scrollToBottom();
		}

		// Timeout to ensure scroll has finished
		// @ts-ignore
		await Bluebird.delay(500);
		this.setState({
			ready: true,
		});
	}

	getSnapshotBeforeUpdate(prevProps: any) {
		const snapshot: any = {};
		if (
			_.get(this.props, ['tail', 'length'], 0) >
			_.get(prevProps, ['tail', 'length'], 0)
		) {
			snapshot.wasAtBottomOfTimeline = this.isAtBottomOfTimeline();
		}
		return snapshot;
	}

	componentDidUpdate(prevProps: any, _prevState: any, snapshot: any) {
		const { pendingMessages } = this.state;
		const { tail } = this.props;

		const newMessages = tail.length > prevProps.tail.length;

		if (newMessages) {
			this.setState(
				{
					pendingMessages: newMessages
						? getFreshPendingMessages(tail, pendingMessages)
						: pendingMessages,
				},
				() => {
					if (snapshot.wasAtBottomOfTimeline) {
						this.scrollToBottom();
					}
				},
			);
		}
	}

	isAtBottomOfTimeline() {
		if (this.timelineEnd.current) {
			try {
				const timelineEndRect =
					this.timelineEnd.current.getBoundingClientRect();
				const timelineRect =
					this.timelineEnd.current.parentElement.getBoundingClientRect();

				// We consider it to be at the bottom if we're within 30 pixels of the bottom
				return _.inRange(
					timelineEndRect.bottom,
					timelineRect.bottom - 1,
					timelineRect.bottom + 30,
				);
			} catch (error) {
				return true;
			}
		}
		return true;
	}

	scrollToEvent(eventId: any) {
		const { tail } = this.props;
		const { reachedBeginningOfTimeline } = this.state;
		const existing = _.find(tail, {
			id: eventId,
		});
		if (existing) {
			const pureType = existing.type.split('@')[0];
			if (pureType === UPDATE || pureType === CREATE) {
				this.handleEventToggle();
			}
			const messageElement = document.getElementById(`event-${eventId}`);
			if (messageElement) {
				messageElement.scrollIntoView({
					behavior: 'smooth',
				});
			}
		} else if (!reachedBeginningOfTimeline) {
			this.retrieveFullTimeline(() => {
				this.scrollToEvent(eventId);
			});
		}
	}

	handleScrollBeginning() {
		return new Promise<void>((resolve) => {
			const { eventSkip } = this.state;
			this.setState(
				{
					loadingMoreEvents: true,
				},
				() => {
					return this.loadMoreEvents({
						limit: PAGE_SIZE,
						skip: eventSkip,
					}).then((newEvents: any[]) => {
						const receivedNewEvents = newEvents.length > 0;
						this.setState({
							eventSkip: receivedNewEvents ? eventSkip + PAGE_SIZE : eventSkip,
							loadingMoreEvents: false,
							reachedBeginningOfTimeline: !receivedNewEvents,
						});
						resolve();
					});
				},
			);
		});
	}

	handleJumpToTop() {
		if (this.state.reachedBeginningOfTimeline) {
			this.scrollToTop();
		} else {
			this.retrieveFullTimeline(() => {
				this.scrollToTop();
			});
		}
	}

	retrieveFullTimeline(callback: any) {
		return this.loadMoreEvents().then(() => {
			this.setState(
				{
					reachedBeginningOfTimeline: true,
				},
				callback,
			);
		});
	}

	handleEventToggle() {
		this.setState({
			messagesOnly: !this.state.messagesOnly,
		});
	}

	handleWhisperToggle() {
		this.setState({
			hideWhispers: !this.state.hideWhispers,
		});
	}

	handleFileChange(files: any, whisper: any) {
		const type = whisper ? 'whisper' : 'message';
		if (!files || !files.length) {
			return;
		}
		const file = _.first(files);
		const message = {
			target: this.props.card,
			tags: [],
			type,
			slug: `${type}-${uuid()}`,
			payload: {
				file,
				message: `${FILE_PROXY_MESSAGE} ${helpers.createPermaLink(
					this.props.card,
				)}`,
			},
		};

		this.setState({
			uploadingFiles: this.state.uploadingFiles.concat(message.slug),
		});

		this.props.sdk.event
			.create(message)
			.then(() => {
				this.props.analytics.track('element.create', {
					element: {
						type,
					},
				});
			})
			.catch((error: any) => {
				addNotification('danger', error.message || error);
			})
			.finally(() => {
				this.setState({
					uploadingFiles: _.without(this.state.uploadingFiles, message.slug),
				});
			});
	}

	handleCardVisible(card: any) {
		this.props.sdk.card
			.markAsRead(
				this.props.user.slug,
				card,
				_.map(_.filter(this.props.groups, 'isMine'), 'name'),
			)
			.catch((error: any) => {
				console.error(error);
			});
	}

	addMessage(newMessage: string, whisper: any) {
		const trimmedMessage = newMessage.trim();
		if (!trimmedMessage) {
			return;
		}
		this.props.setTimelineMessage(this.props.card.id, '');
		const { mentionsUser, alertsUser, mentionsGroup, alertsGroup, tags } =
			helpers.getMessageMetaData(trimmedMessage);
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
				message: helpers.replaceEmoji(
					trimmedMessage.replace(messageSymbolRE, ''),
				),
			},
		};

		// Synthesize the event card and add it to the pending messages so it can be
		// rendered in advance of the API request completing it
		this.setState(
			{
				pendingMessages: this.state.pendingMessages.concat({
					pending: true,
					type: message.type,
					tags,
					slug: message.slug,
					data: {
						actor: this.props.user.id,
						payload: message.payload,
						target: this.props.card.id,
					},
				}),
			},
			() => {
				this.scrollToBottom();
			},
		);

		this.props.sdk.event
			.create(message)
			.then(() => {
				this.props.analytics.track('element.create', {
					element: {
						type: message.type,
					},
				});
			})
			.catch((error: any) => {
				addNotification('danger', error.message || error);
			});
	}

	scrollToTop() {
		if (this.timelineStart.current) {
			this.timelineStart.current.scrollIntoView({
				behaviour: 'smooth',
			});
		}
	}

	scrollToBottom() {
		if (this.timelineEnd.current) {
			this.timelineEnd.current.scrollIntoView();
		}
	}

	loadMoreEvents(options = {}) {
		const { card, loadMoreChannelData } = this.props;
		return loadMoreChannelData({
			target: card.slug,
			query: {
				type: 'object',
				properties: {
					id: {
						const: card.id,
					},
				},
				$$links: {
					'has attached element': {
						type: 'object',
					},
				},
			},
			queryOptions: {
				links: {
					'has attached element': {
						sortBy: 'created_at',
						sortDir: 'desc',
						...options,
					},
				},
			},
		}).then(([newCard]: any[]) => {
			return _.get(newCard, ['links', 'has attached element'], []);
		});
	}

	render() {
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
			tail,
			notifications,
		} = this.props;
		const {
			messagesOnly,
			pendingMessages,
			hideWhispers,
			loadingMoreEvents,
			ready,
			uploadingFiles,
			reachedBeginningOfTimeline,
		} = this.state;

		// Due to a bug in syncing, sometimes there can be duplicate cards in events
		const sortedEvents = _.uniqBy(
			_.sortBy(tail, (event) => {
				return _.get(event, ['data', 'timestamp']) || event.created_at;
			}),
			'id',
		);

		const sendCommand = getSendCommand(user);

		const isMirrored = !_.isEmpty(_.get(card, ['data', 'mirrors']));

		const eventProps = {
			types,
			groups,
			enableAutocomplete,
			sendCommand,
			onCardVisible: this.handleCardVisible,
			notifications,
			user,
			threadIsMirrored: isMirrored,
			menuOptions: eventMenuOptions,
			getActorHref,
			targetCard: card,
		};

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
					{!sortedEvents && (
						<Box p={3}>
							<Loading />
						</Box>
					)}
					<InfiniteList
						fillMaxArea
						onScrollBeginning={
							!reachedBeginningOfTimeline && ready && this.handleScrollBeginning
						}
						processing={loadingMoreEvents}
					>
						<div ref={this.timelineStart} />
						{reachedBeginningOfTimeline && <TimelineStart />}
						{loadingMoreEvents && <Loading />}
						<EventsList
							{...eventProps}
							user={user}
							hideWhispers={hideWhispers}
							sortedEvents={sortedEvents}
							uploadingFiles={uploadingFiles}
							messagesOnly={messagesOnly}
						/>
						{/* @ts-ignore */}
						<PendingMessages
							{...eventProps}
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
						borderTop: '1px solid #eee',
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
		);
	}
}

export default withSetup<TimelineProps>(Timeline);
