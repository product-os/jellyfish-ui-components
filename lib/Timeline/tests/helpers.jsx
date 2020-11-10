/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	getWrapper,
	flushPromises
} from '../../../test/ui-setup'
import {
	SetupProvider
} from '../../SetupProvider'

const {
	wrapper: Wrapper
} = getWrapper()

const wrapperWithSetup = ({
	children,
	sdk
}) => {
	return (
		<Wrapper>
			<SetupProvider sdk={sdk}>
				{ children }
			</SetupProvider>
		</Wrapper>
	)
}

export const timestamp = (new Date()).toISOString()

const createTestContext = (test, sandbox) => {
	const loadMoreChannelData = sandbox.stub()
	loadMoreChannelData.resolves([])

	const createEvent = {
		id: 'fake-create-id',
		type: 'create@1.0.0',
		created_at: timestamp,
		data: {
			timestamp,
			readBy: []
		}
	}

	const whisperEvent = {
		id: 'fake-whisper-id',
		type: 'whisper@1.0.0',
		created_at: timestamp,
		data: {
			timestamp,
			message: 'I am a whisper',
			readBy: []
		}
	}

	const messageEvent = {
		id: 'fake-message-id',
		type: 'message@1.0.0',
		created_at: timestamp,
		data: {
			timestamp,
			message: 'I am a message',
			readBy: []
		}
	}

	const updateEvent = {
		id: 'fake-update-id',
		type: 'update@1.0.0',
		created_at: timestamp,
		data: {
			payload: {
				op: 'add',
				path: 'fake-path'
			}
		}
	}

	const user = {
		id: 'fake-user-id',
		slug: 'user-fakeuser',
		created_at: timestamp,
		type: 'user@1.0.0'
	}

	const getActor = sandbox.stub()
	getActor.resolves(user)

	const tail = [ createEvent, messageEvent, whisperEvent, updateEvent ]

	const eventProps = {
		card: {
			id: 'fake-card-id',
			slug: 'fake-card',
			created_at: timestamp
		},
		selectCard: () => {
			return sandbox.stub()
		},
		getCard: sandbox.stub(),
		usersTyping: [],
		user,
		getActor,
		tail,
		loadMoreChannelData
	}

	return {
		eventProps,
		tail,
		createEvent,
		whisperEvent,
		messageEvent,
		updateEvent,
		loadMoreChannelData
	}
}

export {
	createTestContext,
	wrapperWithSetup,
	flushPromises
}
