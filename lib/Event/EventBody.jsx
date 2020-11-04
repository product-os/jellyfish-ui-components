/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import {
	Button, Txt, Img, Link
} from 'rendition'
import {
	Markdown
} from 'rendition/dist/extra/Markdown'
import {
	HIDDEN_ANCHOR
} from '../Timeline'
import Icon from '../shame/Icon'
import MessageContainer from './MessageContainer'
import {
	PlainAutocompleteTextarea
} from '../Timeline/MessageInput'
import Attachments from './Attachments'
import Mention from './Mention'
import * as helpers from '../services/helpers'
import ErrorBoundary from '../shame/ErrorBoundary'

const tagMatchRE = helpers.createPrefixRegExp(helpers.TAG_MATCH_REGEXP_PREFIX)

const MESSAGE_Y_SPACE = '3px'
const MAX_IMAGE_SIZE = '500px'

const EditingAutocompleteTextarea = styled(PlainAutocompleteTextarea) `
	margin: ${MESSAGE_Y_SPACE} 0;
`

const StyledMarkdown = styled(Markdown)(({
	messageOverflows,
	messageCollapsedHeight,
	expanded
}) => {
	return {
		fontSize: 'inherit',
		maxHeight: !expanded && messageOverflows
			? `${messageCollapsedHeight}px`
			: 'none',
		overflow: messageOverflows ? 'hidden' : 'initial'
	}
})

const DISCOURSE_IMAGE_RE = /!\[(.+?)\|\d*x\d*\]\(upload:\/\/(.+?\..+?)\)/g
const FRONT_MARKDOWN_IMG_RE = /\[\/api\/1\/companies\/resin_io\/attachments\/[a-z0-9]+\?resource_link_id=\d+\]/g
const FRONT_HTML_IMG_RE = /\/api\/1\/companies\/resin_io\/attachments\/[a-z0-9]+\?resource_link_id=\d+/g
const IMAGE_URL_RE = /^https?:\/\/.*\.(?:png|jpg|gif)(?:\?\S*)*$/

const OverflowButton = styled(Button) `
	color: inherit;

	&:hover {
		color: inherit !important;
	}

	${(expanded) => {
		return expanded ? {} : 'boxShadow: \'0 -5px 5px -5px rgba(0,0,0,0.5)\''
	}}
`

export const getMessage = (card) => {
	const message = _.get(card, [ 'data', 'payload', 'message' ], '')

	if (message.trim().match(IMAGE_URL_RE)) {
		return `![image](${message.trim()})`
	}

	// Fun hack to extract attached screenshots from synced Discourse messages
	// into markdown images
	if (message.match(DISCOURSE_IMAGE_RE)) {
		return message.replace(DISCOURSE_IMAGE_RE, (link, filename, urlPrefix) => {
			return `![${filename}](https://forums.balena.io/uploads/short-url/${urlPrefix})`
		})
	}

	// Fun hack to extract attached images embedded in HTML from synced front messages
	if (message.includes('<img src="/api/1/companies/resin_io/attachments')) {
		return message.replace(FRONT_HTML_IMG_RE, (source) => {
			return `https://app.frontapp.com${source}`
		})
	}

	// Fun hack to extract attached images from synced front messages embedded in
	// a different way
	if (message.match(FRONT_MARKDOWN_IMG_RE)) {
		return message.replace(FRONT_MARKDOWN_IMG_RE, (source) => {
			return `![Attached image](https://app.frontapp.com${source.slice(
				1,
				-1
			)})`
		})
	}

	return message
		.split('\n')
		.filter((line) => {
			return !line.includes(HIDDEN_ANCHOR)
		})
		.join('\n')
}

const IMG_STYLE = {
	maxWidth: `min(${MAX_IMAGE_SIZE}, 100%)`,
	maxHeight: MAX_IMAGE_SIZE
}

const componentOverrides = {
	img: (attribs) => {
		return <Img {...attribs} style={IMG_STYLE} />
	},
	// eslint-disable-next-line id-length
	a: (attribs) => {
		// TODO: Use RouterLink and navigate internally if the href
		// is on the same domain.
		return <Link blank {...attribs} />
	},
	mention: (attribs) => {
		return <Mention {...attribs} />
	}
}

const EventBody = (props) => {
	const {
		squashTop,
		squashBottom,
		enableAutocomplete,
		sendCommand,
		types,
		user,
		groups,
		sdk,
		card,
		actor,
		isMessage,
		editedMessage,
		updating,
		onUpdateDraft,
		onSaveEditedMessage,
		messageOverflows,
		setMessageElement,
		messageCollapsedHeight
	} = props

	const [ expanded, setExpanded ] = React.useState(false)

	const expand = React.useCallback(() => {
		setExpanded(!expanded)
	}, [ expanded ])

	const message = getMessage(card)

	const decorators = React.useMemo(() => {
		return [ {
			match: tagMatchRE,
			captureGroupIndex: 2,
			component: 'mention',
			properties: {
				readBy: card.data.readBy,
				slug: user.slug,
				groups
			}
		} ]
	}, [
		card.data.readBy,
		user.slug,
		groups
	])

	return (
		<React.Fragment>
			<Attachments
				card={card}
				actor={actor}
				sdk={sdk}
				maxImageSize={MAX_IMAGE_SIZE}
				squashTop={squashTop}
				squashBottom={squashBottom}
			/>
			{
				isMessage && Boolean(message) && (
					<MessageContainer
						ref={setMessageElement}
						card={card}
						actor={actor}
						editing={editedMessage !== null}
						squashTop={squashTop}
						squashBottom={squashBottom}
						py={2}
						px={3}
						mr={1}
					>
						{editedMessage !== null && !updating ? (
							<EditingAutocompleteTextarea
								data-test="event__textarea"
								enableAutocomplete={enableAutocomplete}
								sdk={sdk}
								types={types}
								user={user}
								autoFocus
								sendCommand={sendCommand}
								value={editedMessage}
								onChange={onUpdateDraft}
								onSubmit={onSaveEditedMessage}
							/>
						) : (
							<StyledMarkdown
								expanded={expanded}
								messageOverflows={messageOverflows}
								messageCollapsedHeight={messageCollapsedHeight}
								py={MESSAGE_Y_SPACE}
								data-test={card.pending || updating ? 'event-card__message-draft' : 'event-card__message'}
								flex={0}
								componentOverrides={componentOverrides}
								decorators={decorators}
							>
								{updating ? editedMessage : message}
							</StyledMarkdown>
						)}
						{messageOverflows && (
							<OverflowButton
								className="event-card__expand"
								plain
								width="100%"
								py={1}
								onClick={expand}
								expanded={expanded}
							>
								<Icon name={`chevron-${expanded ? 'up' : 'down'}`} />
							</OverflowButton>
						)}
					</MessageContainer>
				)
			}
			{
				!isMessage && Boolean(card.name) && (
					<Txt>{card.name}</Txt>
				)
			}
		</React.Fragment>
	)
}

export default (props) => {
	const getErrorElement = React.useCallback(() => {
		return (
			<MessageContainer
				data-test="eventBody__errorMessage"
				ref={props.setMessageElement}
				card={props.card}
				actor={props.actor}
				py={2}
				px={3}
				mr={1}
				error={true}
			>An error occured while attempting to render this message</MessageContainer>
		)
	}, [
		props.setMessageElement,
		props.card,
		props.actor
	])

	return (
		<ErrorBoundary getErrorElement={getErrorElement}>
			<EventBody {...props} />
		</ErrorBoundary>
	)
}
