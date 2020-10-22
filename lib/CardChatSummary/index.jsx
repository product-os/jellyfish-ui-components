/*
 * Copyright (C) Balena.io - All Rights Reserved TEST
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import {
	circularDeepEqual
} from 'fast-equals'
import _ from 'lodash'
import React from 'react'
import {
	Flex,
	Txt
} from 'rendition'
import styled, {
	withTheme
} from 'styled-components'
import Link from '../Link'
import * as helpers from '../services/helpers'
import ColorHashPill from '../shame/ColorHashPill'
import {
	TagList
} from '../Tag'
import {
	MessageSnippet
} from './MessageSnippet'
import {
	TimeSummary
} from './TimeSummary'
import {
	OwnerDisplay
} from './OwnerDisplay'

const TitleTxt = styled(Txt) `
	display: block;
	flex: 1;
	min-width: 0;
	whiteSpace: nowrap;
	overflow: hidden;
	textOverflow: ellipsis;
`

const SummaryWrapper = styled(Link) `
	display: block;
	padding: 18px 16px;
	border-left-style: solid;
	border-left-width: 4px;
	border-bottom: 1px solid #eee;
	cursor: pointer;
	color: ${(props) => { return props.theme.colors.text.main }};
	box-shadow: -5px 4.5px 10.5px 0 rgba(152, 173, 227, 0.08);

	${(props) => {
		return props.active ? `
			background: ${props.theme.colors.info.light};
			border-left-color: ${props.theme.colors.info.main};
		` : `
			background: white;
			border-left-color: transparent;
		`
	}}

	&:hover {
		color: ${(props) => { return props.theme.colors.text.main }};
		background: ${(props) => { return props.theme.colors.quartenary.light }};
	}
`

export class CardChatSummary extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			actor: null
		}
	}

	shouldComponentUpdate (nextProps, nextState) {
		return !circularDeepEqual(nextState, this.state) || !circularDeepEqual(nextProps, this.props)
	}

	componentDidMount () {
		this.setActors()
	}

	async setActors () {
		const card = this.props.card
		const actor = await helpers.getCreator(this.props.getActor, card)

		this.setState({
			actor
		})
	}

	render () {
		const {
			card,
			selectCard,
			getCard,
			timeline,
			active,
			to,
			theme,
			highlightedFields,
			displayOwner,
			...rest
		} = this.props

		const {
			actor
		} = this.state

		const latestMessageCard = _.findLast(timeline, (event) => {
			const typeBase = event.type.split('@')[0]
			return typeBase === 'message' || typeBase === 'whisper'
		})

		const createdTime = _.get(helpers.getCreateCard(card), [ 'data', 'timestamp' ])
		const updatedTime = _.get(helpers.getLastUpdate(card), [ 'data', 'timestamp' ])

		const threadOwner = _.get(card.links, [ 'is owned by', 0 ])

		return (
			<SummaryWrapper
				data-test-component="card-chat-summary"
				data-test-id={card.id}
				active={active}
				to={to}
				{...rest}
			>
				<Flex justifyContent="space-between" mb={3} flexWrap="wrap">
					<Flex alignItems="flex-start" flexWrap="wrap">
						{_.map(highlightedFields, (keypath) => {
							return <ColorHashPill key={keypath} value={_.get(card, keypath)} mr={2} mb={1} />
						})}

						<TagList
							tags={card.tags.filter((tag) => { return !tag.includes('pending') })}
							blacklist={[ 'status', 'summary' ]}
							tagProps={{
								style: {
									lineHeight: 1.5,
									fontSize: 10,
									letterSpacing: 0.5
								}
							}}
						/>
					</Flex>

					<Flex alignItems="center" mb={1} color="text.light">
						{_.get(card.links, [ 'has attached element' ], []).length > 0 && (
							<React.Fragment>
								<TimeSummary timestamp={createdTime} prefix="Created" iconName="history" ml={3} />
								<TimeSummary timestamp={updatedTime} prefix="Updated" iconName="sync" ml={3} />
							</React.Fragment>
						)}
						{ displayOwner && <OwnerDisplay owner={threadOwner} selectCard={selectCard} getCard={getCard} ml={3} /> }
					</Flex>
				</Flex>

				<TitleTxt bold mb={1}>
					{card.name || (actor && `Conversation with ${actor.name}`) || card.slug}
				</TitleTxt>

				<MessageSnippet messageCard={latestMessageCard} selectCard={selectCard} getCard={getCard} mt={2}/>
			</SummaryWrapper>
		)
	}
}

export default withTheme(CardChatSummary)
