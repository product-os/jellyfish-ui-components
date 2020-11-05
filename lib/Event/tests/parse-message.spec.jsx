/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import {
	parseMessage
} from '../EventBody'

ava('parseMessage() should prefix Front image embedded in img tags', (test) => {
	const url = '/api/1/companies/resin_io/attachments/8381633c052e15b96c3a25581f7869b5332c032b?resource_link_id=14267942787'
	test.is(parseMessage(`<img src="${url}">`), `<img src="https://app.frontapp.com${url}">`)
})

ava('parseMessage() should prefix multitple Front images embedded in img tags', (test) => {
	const url = '/api/1/companies/resin_io/attachments/8381633c052e15b96c3a25581f7869b5332c032b?resource_link_id=14267942787'
	test.is(
		parseMessage(`<img src="${url}"><img src="${url}"><img src="${url}"><img src="${url}">`),
		`<img src="https://app.frontapp.com${url}"><img src="https://app.frontapp.com${url}"><img src="https://app.frontapp.com${url}"><img src="https://app.frontapp.com${url}">`
	)
})

ava('parseMessage() should prefix Front image embedded in square brackets', (test) => {
	const url = '/api/1/companies/resin_io/attachments/8381633c052e15b96c3a25581f7869b5332c032b?resource_link_id=14267942787'
	test.is(parseMessage(`[${url}]`), `![Attached image](https://app.frontapp.com${url})`)
})

ava('parseMessage() should prefix multiple Front images embedded in square brackets', (test) => {
	const url = '/api/1/companies/resin_io/attachments/8381633c052e15b96c3a25581f7869b5332c032b?resource_link_id=14267942787'
	test.is(
		parseMessage(`[${url}] [${url}] [${url}]`),
		`![Attached image](https://app.frontapp.com${url}) ![Attached image](https://app.frontapp.com${url}) ![Attached image](https://app.frontapp.com${url})`
	)
})

ava('parseMessage() should hide "#jellyfish-hidden" messages', (test) => {
	test.is(parseMessage('#jellyfish-hidden'), '')
})

ava('parseMessage() detects a message that only contains an image url and wraps it', (test) => {
	const jpgURL = 'http://test.com/image.jpg?some-data=2'
	const pngURL = 'http://test.co.uk/image%20again.png?some-data=+2'
	const gifURL = 'https://wwww.test.com/image.gif'
	const imageMessage = (url) => {
		return `![image](${url})`
	}
	test.is(parseMessage(jpgURL), imageMessage(jpgURL))
	test.is(parseMessage(pngURL), imageMessage(pngURL))
	test.is(parseMessage(gifURL), imageMessage(gifURL))
	test.is(parseMessage(` ${jpgURL}`), imageMessage(jpgURL))
	test.is(parseMessage(`${jpgURL} `), imageMessage(jpgURL))
	test.not(parseMessage(`>${jpgURL}`), imageMessage(jpgURL))
	test.not(parseMessage(`${jpgURL}!`), imageMessage(jpgURL))
})

ava('parseMessage() replaces inline Discourse attachment links with correct markdown links', (test) => {
	const msg = parseMessage(
		'This is a link: [file1.log|attachment](upload://2NTd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB) ' +
		'This is another link: [file2.log|attachment](upload://4EDd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB)'
	)
	test.is(msg,
		'This is a link: [file1.log](https://forums.balena.io/uploads/short-url/2NTd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB) ' +
		'This is another link: [file2.log](https://forums.balena.io/uploads/short-url/4EDd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB)')
})

ava('parseMessage() replaces inline Discourse images with correct markdown images', (test) => {
	const msg = parseMessage(
		'This is an inline image: ![file1.log|600x400](upload://2NTd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB) ' +
		'This is another inline image: ![file2.log|64x48](upload://4EDd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB)'
	)
	test.is(msg,
		'This is an inline image: ![file1.log](https://forums.balena.io/uploads/short-url/2NTd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB) ' +
		'This is another inline image: ![file2.log](https://forums.balena.io/uploads/short-url/4EDd93eaDOQohgCHeMpUr5cynbL.log) (149.6 KB)')
})
