/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import _ from 'lodash'
import {
	MESSAGE,
	WHISPER,
	SUMMARY,
	RATING
} from './constants'

export const getTypeBase = (type) => {
	return type.split('@')[0]
}

export const isTimelineEvent = (type) => {
	const typeBase = getTypeBase(type)
	return _.includes([ MESSAGE, WHISPER, SUMMARY, RATING ], typeBase)
}

export const isPrivateTimelineEvent = (type) => {
	const typeBase = getTypeBase(type)
	return _.includes([ WHISPER, SUMMARY, RATING ], typeBase)
}
