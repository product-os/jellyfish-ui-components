/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react'
import {
	Box,
	Button,
	Flex,
	Txt,
	useTheme
} from 'rendition'
import styled from 'styled-components'
import AutocompleteTextarea from '../shame/AutocompleteTextarea'
import {
	FaUserSecret
} from 'react-icons/fa'
import {
	MdSend
} from 'react-icons/md'
import {
	FilesInput
} from '../FileUploader'

export const messageSymbolRE = /^\s*%\s*/

export const PlainAutocompleteTextarea = styled(AutocompleteTextarea) `
	border: 0 !important;
	background-color: transparent !important;
	box-shadow: none !important;
	outline: none !important;
	padding: 0 !important;
	color: inherit;
`

const InputWrapper = styled(Box) `
	position: relative;
	border: solid 1px ${(props) => { return props.borderColor || props.theme.colors.gray.main }};
	border-radius: ${(props) => { return props.theme.radius }}px;

	&:focus-within {
		border-color: ${(props) => { return props.borderColorWhenFocused || props.theme.colors.primary.main }};
	}

	${(props) => {
		return props.bubble ? `
			&::after {
				content: ' ';
				position: absolute;
				width: 0;
				height: 0;
			}
		` : ''
	}}

	${(props) => {
		return props.wide ? `
			&::after {
				top: calc(50% - 6px);
				right: -6px;
				border-top: 6px solid transparent;
				border-bottom: 6px solid transparent;
				border-left: 6px solid ${props.borderColor};
			}
		` : `
			&::after {
				left: 14px;
				bottom: -6px;
				border-left: 6px solid transparent;
				border-right: 6px solid transparent;
				border-top: 6px solid ${props.borderColor};
			}
		`
	}}
`

const MessageInput = ({
	allowWhispers,
	sendCommand,
	value,
	onChange,
	onSubmit,
	files,
	onFileChange,
	signalTyping,
	preserveMessage,
	wide = true,
	style,
	enableAutocomplete,
	types,
	user,
	sdk,
	...rest
}) => {
	const theme = useTheme()
	const [ whisper, setWhisper ] = React.useState(allowWhispers)
	const [ messageSymbol, setMessageSymbol ] = React.useState(false)
	const [ message, setMessage ] = React.useState(value)
	const [ innerRef, setInnerRef ] = React.useState(null)

	const getMessageInputDefaultPlaceholder = React.useCallback(() => {
		if (!allowWhispers) {
			return 'Type your message...'
		}

		if (whisper) {
			return 'Type your private comment...'
		}

		return 'Type your public reply...'
	}, [ allowWhispers, whisper ])

	const isWhisper = React.useCallback(() => {
		return allowWhispers && messageSymbol ? false : whisper
	}, [ allowWhispers, messageSymbol, whisper ])

	const saveMessage = React.useCallback(() => {
		if (innerRef && preserveMessage) {
			preserveMessage(innerRef.value)
		}
	}, [ innerRef, preserveMessage ])

	// Note: for efficiency we want to only preserve the message when
	// unmounting. However with React hooks it is not possible to access
	// current 'message' state within a useEffect cleanup method unless 'message'
	// is in the dependency list for the useEffect call - which would result
	// in the cleanup method being called each time the message is updated.
	// The following is a workaround, making use of a ref, to ensure we only
	// preserve the message when the component is unmounted.
	React.useEffect(() => {
		window.onbeforeunload = saveMessage
		return () => {
			saveMessage()
			window.onbeforeunload = null
		}
	}, [ innerRef ])

	const toggleWhisper = React.useCallback(() => {
		setWhisper(!whisper)
	}, [ whisper ])

	React.useEffect(() => {
		setMessageSymbol(!allowWhispers || Boolean(message.match(messageSymbolRE)))
	}, [ allowWhispers, message ])

	const onSubmitInput = React.useCallback((event) => {
		event.preventDefault()
		onSubmit(message, isWhisper())
		setWhisper(allowWhispers)
		setMessage('')
	}, [ allowWhispers, messageSymbol, message, whisper, onSubmit, isWhisper ])

	const onInputChange = React.useCallback((event) => {
		event.preventDefault()
		const messageText = event.target.value
		setMessage(messageText)
		if (onChange) {
			onChange(event)
		}
		if (signalTyping) {
			signalTyping()
		}
	}, [ signalTyping, onChange ])

	const handlePaste = React.useCallback((event) => {
		const copiedFiles = Array.from(event.clipboardData.files)

		if (copiedFiles.length) {
			event.preventDefault()
			onFileChange(copiedFiles, isWhisper())
		}
	}, [ onFileChange, whisper, allowWhispers, messageSymbol, isWhisper ])

	const handleFileChange = React.useCallback((fileList) => {
		onFileChange(fileList, isWhisper())
	}, [ onFileChange, whisper, allowWhispers, messageSymbol, isWhisper ])

	const textInput = (
		<InputWrapper
			bubble={whisper}
			py={2}
			px={3}
			wide={wide}
			{...(whisper ? {
				color: theme.colors.text.main,
				bg: theme.colors.primary.main,
				borderColor: theme.colors.primary.dark
			} : {
				color: theme.colors.text.main,
				borderColor: theme.colors.background.dark,
				bg: theme.colors.background.main,
				borderColorWhenFocused: theme.colors.primary.main,
				...(wide ? {
					px: 0
				} : {})
			})}>
			<PlainAutocompleteTextarea
				innerRef={setInnerRef}
				enableAutocomplete={enableAutocomplete}
				sdk={sdk}
				types={types}
				user={user}
				sendCommand={sendCommand}
				className="new-message-input"
				value={message}
				onChange={onInputChange}
				onSubmit={onSubmitInput}
				onPaste={handlePaste}
				placeholder={getMessageInputDefaultPlaceholder()}
			/>
		</InputWrapper>
	)

	const toggleWhisperButton = Boolean(allowWhispers) && (
		<Button
			p={1}
			fontSize="18px"
			plain
			primary
			onClick={toggleWhisper}
			data-test="timeline__whisper-toggle"
			tooltip={{
				placement: 'left',
				text: `Toggle response visibility (currently ${whisper ? 'private' : 'public'})`
			}}
			icon={<FaUserSecret />}
			style={{
				opacity: whisper ? 1 : 0.6
			}}
		/>
	)

	if (wide) {
		return (
			<Box
				{...rest}
				pt={3}
				pb={1}
				pl={3}
				bg="background.main"
				style={{
					...style,
					display: 'grid',
					gridTemplateColumns: 'auto fit-content(100%)',
					gridTemplateRows: 'auto auto',
					alignItems: 'center'
				}}
			>
				<Box flex={1} style={{
					gridColumn: 1,
					gridRow: 1
				}}>
					{textInput}
				</Box>
				<Flex px={2} style={{
					gridColumn: 2,
					gridRow: 1
				}}>
					{toggleWhisperButton}
					<FilesInput
						value={files}
						onChange={handleFileChange}
					/>
				</Flex>
				<Box style={{
					gridColumn: 1,
					gridRow: 2
				}}>
					<Txt fontSize={11} italic color="text.light">
						Press {sendCommand} to send
					</Txt>
				</Box>
			</Box>
		)
	}

	return (
		<Flex
			{...rest}
			style={style}
			bg="background.main"
			flexDirection="column"
		>
			<Box
				flex="1"
				px={1}
			>
				{textInput}
			</Box>

			<Flex px={2} alignItems="center" style={{
				borderTop: `solid 1px ${theme.colors.text.main})`,
				borderTopStyle: 'dashed'
			}}>
				<Flex alignSelf="flex-start" p={1}>
					{toggleWhisperButton}
					<FilesInput
						value={files}
						onChange={handleFileChange}
					/>
				</Flex>
				<Box style={{
					marginLeft: 'auto'
				}}>
					{onSubmit && (
						<Button
							p={2}
							plain
							primary
							fontSize={26}
							tooltip={{
								text: sendCommand,
								placement: 'left'
							}}
							icon={<MdSend />}
							onClick={onSubmitInput}
						/>
					)}
				</Box>
			</Flex>
		</Flex>
	)
}

export default MessageInput
