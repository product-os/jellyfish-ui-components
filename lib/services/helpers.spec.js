/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import ava from 'ava'
import _ from 'lodash'
import format from 'date-fns/format'
import sub from 'date-fns/sub'
import add from 'date-fns/add'
import * as helpers from './helpers'

const user = {
	slug: 'user',
	type: 'type@1.0.0',
	version: '1.0.0',
	name: 'Jellyfish User',
	data: {
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						status: {
							oneOf: [
								{
									type: 'object',
									properties: {
										title: {
											type: 'string',
											const: 'Do Not Disturb'
										},
										value: {
											type: 'string',
											const: 'DoNotDisturb'
										}
									}
								},
								{
									type: 'object',
									properties: {
										title: {
											type: 'string',
											const: 'On Annual Leave'
										},
										value: {
											type: 'string',
											const: 'AnnualLeave'
										}
									}
								},
								{
									type: 'object',
									properties: {
										title: {
											type: 'string',
											const: 'In a Meeting'
										},
										value: {
											type: 'string',
											const: 'Meeting'
										}
									}
								},
								{
									type: 'object',
									properties: {
										title: {
											type: 'string',
											const: 'Available'
										},
										value: {
											type: 'string',
											const: 'Available'
										}
									}
								}
							]
						}
					}
				}
			}
		}
	}
}

ava('.slugify replaces non text with hyphens', (test) => {
	test.is(helpers.slugify('balena []{}#@io'), 'balena-io')
})

ava('.slugify converts text to lowercase', (test) => {
	test.is(helpers.slugify('Balena IO'), 'balena-io')
})

ava('.slugify strips any trailing spaces', (test) => {
	test.is(helpers.slugify('balena '), 'balena')
})

ava('formatTimestamp returns time if date is today', (test) => {
	const timestamp = new Date()
	timestamp.setHours(2)
	timestamp.setMinutes(34)
	const formatted = helpers.formatTimestamp(timestamp.toISOString(), true)
	test.is(formatted, 'at 02:34')
})

ava('formatTimestamp returns full time if date is not today', (test) => {
	const timestamp = sub(new Date(), {
		days: 2
	})
	const formatted = helpers.formatTimestamp(timestamp.toISOString(), true)

	// Not ideal but easiest way to avoid timezone issues
	test.is(formatted, `on ${format(timestamp, 'MMM do, yyyy HH:mm')}`)
})

ava('timeAgo returns empty string if invalid timestamp is provided', (test) => {
	test.is(helpers.timeAgo('abcd'), '')
	test.is(helpers.timeAgo(null), '')
	// eslint-disable-next-line no-undefined
	test.is(helpers.timeAgo(undefined), '')
})

ava('timeAgo can return time in the past', (test) => {
	const timestamp = sub(new Date(), {
		hours: 1,
		minutes: 1
	})
	test.is(helpers.timeAgo(timestamp.toISOString()), 'about 1 hour ago')
})

ava('timeAgo can return time in the future', (test) => {
	const timestamp = add(new Date(), {
		hours: 1,
		minutes: 1
	})
	test.is(helpers.timeAgo(timestamp.toISOString()), 'in about 1 hour')
})

ava('.isCustomView returns true if view is custom', (test) => {
	const view = {
		slug: 'view-user-created-view-1',
		markers: [ user.slug ]
	}
	test.true(helpers.isCustomView(view, user.slug))
})

ava('.isCustomView returns false if view is not user-created', (test) => {
	const view = {
		slug: 'view-2',
		markers: [ user.slug ]
	}
	test.false(helpers.isCustomView(view, user.slug))
})

ava('.isCustomView returns false if user is not the only marker', (test) => {
	const view = {
		slug: 'view-user-created-view-1',
		markers: [ user.slug, 'org-balena' ]
	}
	test.false(helpers.isCustomView(view, user.slug))
})

ava('.replaceEmoji replaces colon-encoded emoji but leaves unknown ones untouched', (test) => {
	test.is(helpers.replaceEmoji('Test :+1: :unknown:'), 'Test 👍 :unknown:')
})

ava('.createPrefixRegExp() match underscore characters', (test) => {
	const matchRE = helpers.createPrefixRegExp('@')
	const match = matchRE.exec('Lorem ipsum @user_name dolor sit amet')

	test.deepEqual(match[2], '@user_name')
})

ava('.createPrefixRegExp() match period characters', (test) => {
	const matchRE = helpers.createPrefixRegExp('@')
	const match = matchRE.exec('Lorem ipsum @user.name dolor sit amet')

	test.deepEqual(match[2], '@user.name')
})

ava('.createFullTextSearchFilter() uses regex by default on string properties', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: 'string'
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.title.regexp.pattern, searchTerm)
})

ava('.createFullTextSearchFilter() uses regex on properties where the type array includes string', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: [ 'array', 'string' ]
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.title.regexp.pattern, searchTerm)
})

ava('.createFullTextSearchFilter() uses fullTextSearch on properties with the \'fullTextSearch\' field set', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: 'string',
				fullTextSearch: true
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.title.fullTextSearch.term, searchTerm)
})

ava('.createFullTextSearchFilter() only filters on fullTextSearch fields if any \'fullTextSearch\' field found', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: 'string',
				fullTextSearch: true
			},
			description: {
				type: 'string'
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf.length, 1)
	test.is(filter.anyOf[0].properties.title.fullTextSearch.term, searchTerm)
})

ava('.createFullTextSearchFilter() works on deeply nested objects', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: 'object',
				properties: {
					label: {
						type: 'string'
					}
				}
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.title.properties.label.regexp.pattern, searchTerm)
})

ava('.createFullTextSearchFilter() returns null if no fullTextSearch fields and fullTextSearchFieldsOnly is set', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			title: {
				type: 'string'
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm, true)
	test.is(filter, null)
})

// TODO: Unskip this test once we fix the flattening of arrays.
ava.skip('.createFullTextSearchFilter() works on arrays of strings', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			folders: {
				type: 'array',
				items: {
					type: 'string'
				}
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.folders.items.regexp.pattern, searchTerm)
})

// TODO: Unskip this test once we fix the flattening of arrays of objects.
ava.skip('.createFullTextSearchFilter() works on arrays of objects', (test) => {
	const searchTerm = 'test'
	const schema = {
		properties: {
			folders: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						label: {
							type: 'string'
						}
					}
				}
			}
		}
	}
	const filter = helpers.createFullTextSearchFilter(schema, searchTerm)
	test.is(filter.anyOf[0].properties.folders.items.label.regexp.pattern, searchTerm)
})

ava('.getUpdateObjectFromSchema() should parse the `const` keyword', (test) => {
	const schema = {
		type: 'object',
		properties: {
			type: {
				const: 'message@1.0.0'
			},
			data: {
				type: 'object',
				properties: {
					number: {
						const: 1
					},
					string: {
						const: 'foobar'
					},
					boolean: {
						const: true
					}
				}
			}
		}
	}

	const result = helpers.getUpdateObjectFromSchema(schema)

	test.deepEqual(result, {
		type: 'message@1.0.0',
		data: {
			number: 1,
			string: 'foobar',
			boolean: true
		}
	})
})

ava('.getUpdateObjectFromSchema() should parse the `contains` keyword', (test) => {
	const schema = {
		type: 'object',
		properties: {
			tags: {
				contains: {
					const: 'i/frontend'
				}
			}
		}
	}

	const result = helpers.getUpdateObjectFromSchema(schema)

	test.deepEqual(result, {
		tags: [ 'i/frontend' ]
	})
})

ava('.getSlugsByPrefix() should get user ids by parsing text', (test) => {
	const source = '@johndoe'

	const result = helpers.getSlugsByPrefix('@', source, 'user-')

	test.deepEqual(result, [ 'user-johndoe' ])
})

ava('.getSlugsByPrefix() should return an array of unique values', (test) => {
	const source = '@johndoe @johndoe @janedoe'

	const result = helpers.getSlugsByPrefix('@', source, 'user-')

	test.deepEqual(result, [ 'user-johndoe', 'user-janedoe' ])
})

ava('.getSlugsByPrefix() should be able to use an exclamation mark as a prefix', (test) => {
	const source = '!johndoe'

	const result = helpers.getSlugsByPrefix('!', source, 'user-')

	test.deepEqual(result, [ 'user-johndoe' ])
})

ava('.findWordsByPrefix() should ignore # symbols in urls', (test) => {
	const source = 'http://localhost:9000/#/231cd14d-e92a-4a19-bf16-4ce2535bf5c8'

	test.deepEqual(helpers.findWordsByPrefix('#', source), [])
})

ava('.findWordsByPrefix() should ignore @ symbols in email addresses', (test) => {
	const source = 'test@example.com'

	test.deepEqual(helpers.findWordsByPrefix('@', source), [])
})

ava('.findWordsByPrefix() should ignore symbols with no following test', (test) => {
	const source = '!'

	test.deepEqual(helpers.findWordsByPrefix('!', source), [])
})

ava('.findWordsByPrefix() should trim leading space', (test) => {
	const source = 'Test #tag'
	test.deepEqual(helpers.findWordsByPrefix('#', source), [ '#tag' ])
})

ava('.getUserStatuses() returns a dictionary of statuses if status is provided in schema', (test) => {
	const userStatuses = helpers.getUserStatuses(user)
	const dnd = userStatuses.DoNotDisturb
	test.is(dnd.title, 'Do Not Disturb')
	test.is(dnd.value, 'DoNotDisturb')
})

ava('.getUserStatuses() returns an empty object if status is missing from schema', (test) => {
	const userType = _.omit(user, 'data.schema.properties.data.properties.status')
	test.deepEqual(helpers.getUserStatuses(userType), {})
})

ava('.getRelationshipTargetType() returns top level type if defined', (test) => {
	const relationship = {
		type: 'some-type@1.0.0'
	}
	test.is(helpers.getRelationshipTargetType(relationship), 'some-type')
})

ava('.getRelationshipTargetType() returns query type if top level type not defined', (test) => {
	const relationship = {
		query: [
			{
				type: 'some-query-type@1.0.0'
			}
		]
	}
	test.is(helpers.getRelationshipTargetType(relationship), 'some-query-type')
})

ava('getActorIdFromCard gets the actor from the card data first', (test) => {
	const card = {
		id: '1',
		data: {
			actor: 'test-actor-id'
		}
	}
	test.is(helpers.getActorIdFromCard(card), 'test-actor-id')
})

ava('getActorIdFromCard gets the actor from the linked create card if card has no actor', (test) => {
	const card = {
		id: '2',
		data: {},
		links: {
			'has attached element': [
				{
					id: 'create-1',
					data: {
						actor: 'create-actor-id'
					},
					type: 'create@1.0.0'
				}
			]
		}
	}
	test.is(helpers.getActorIdFromCard(card), 'create-actor-id')
})

ava('generateActorFromUserCard can generate name from slug', (test) => {
	const card = {
		slug: 'user-foobar',
		links: {
			'is member of': [
				{
					slug: 'org-balena'
				}
			]
		}
	}
	const actor = helpers.generateActorFromUserCard(card)
	test.is(actor.name, 'foobar')
	test.is(actor.proxy, false)
})

ava('generateActorFromUserCard can generate name from handle', (test) => {
	const card = {
		slug: 'user-foobar',
		data: {
			handle: 'a-handle'
		}
	}
	const actor = helpers.generateActorFromUserCard(card)
	test.is(actor.name, '[a-handle]')
})

ava('generateActorFromUserCard can generate name from email', (test) => {
	const card = {
		slug: 'user-foobar',
		data: {
			email: 'user@test.com'
		}
	}
	const actor = helpers.generateActorFromUserCard(card)
	test.is(actor.name, '[user@test.com]')
})

ava('generateActorFromUserCard generates proxy, email and avatarUrl from card', (test) => {
	const card = {
		slug: 'user-foobar',
		data: {
			email: 'user@test.com',
			avatar: 'https://www.example.com'
		}
	}
	const actor = helpers.generateActorFromUserCard(card)
	test.is(actor.avatarUrl, 'https://www.example.com')
	test.is(actor.email, 'user@test.com')
	test.is(actor.proxy, true)
})

ava('.stringToNumber() should convert string to number', (test) => {
	const string = 'string of text'

	const result = helpers.stringToNumber(string, 10)

	test.deepEqual(result, 0)
})

ava('.stringToNumber() should convert string to number while not exeeding the maximum', (test) => {
	const max = 100
	const array = [ 'What', 'it', 'means', 'when', 'media', 'moves', 'from',
		'the', 'new', 'to', 'the', 'habitual—when', 'our', 'bodies',
		'become', 'archives', 'of', 'supposedly', 'obsolescent', 'media,', 'streaming,',
		'updating,', 'sharing,', 'saving', 'New', 'media—we', 'are', 'told—exist', 'at',
		'the', 'bleeding', 'edge', 'of', 'obsolescence.', 'We', 'thus',
		'forever', 'try', 'to', 'catch', 'up,', 'updating', 'to',
		'remain', 'the', 'same.', 'Meanwhile,', 'analytic,', 'creative,', 'and',
		'commercial', 'efforts', 'focus', 'exclusively', 'on', 'the', 'next',
		'big', 'thing:', 'figuring', 'out', 'what', 'will', 'spread',
		'and', 'who', 'will', 'spread', 'it', 'the', 'fastest.',
		'But', 'what', 'do', 'we', 'miss', 'in', 'this',
		'constant', 'push', 'to', 'the', 'future?', 'In', 'Updating',
		'to', 'Remain', 'the', 'Same,', 'Wendy', 'Hui', 'Kyong',
		'Chun', 'suggests', 'another', 'approach,', 'arguing', 'that', 'our',
		'media', 'matter', 'most', 'when', 'they', 'seem', 'not',
		'to', 'matter', 'at', 'all—when', 'they', 'have', 'moved',
		'from', '“new”', 'to', 'habitual.', 'Smart', 'phones,', 'for',
		'example,', 'no', 'longer', 'amaze,', 'but', 'they', 'increasingly',
		'structure', 'and', 'monitor', 'our', 'lives.', 'Through', 'habits,',
		'Chun', 'says,', 'new', 'media', 'become', 'embedded', 'in',
		'our', 'lives—indeed,', 'we', 'become', 'our', 'machines:', 'we',
		'stream,', 'update,', 'capture,', 'upload,', 'link,', 'save,', 'trash,',
		'and', 'troll', 'Chun', 'links', 'habits', 'to', 'the', 'rise',
		'of', 'networks', 'as', 'the', 'defining', 'concept', 'of',
		'our', 'era.', 'Networks', 'have', 'been', 'central', 'to',
		'the', 'emergence', 'of', 'neoliberalism,', 'replacing', '“society”', 'with',
		'groupings', 'of', 'individuals', 'and', 'connectable', '“YOUS.”', '(For',
		'isn\'t', '“new', 'media”', 'actually', '“NYOU', 'media”?)', 'Habit',
		'is', 'central', 'to', 'the', 'inversion', 'of', 'privacy',
		'and', 'publicity', 'that', 'drives', 'neoliberalism', 'and', 'networks.',
		'Why', 'do', 'we', 'view', 'our', 'networked', 'devices',
		'as', '“personal”', 'when', 'they', 'are', 'so', 'chatty',
		'and', 'promiscuous?', 'What', 'would', 'happen,', 'Chun', 'asks,',
		'if,', 'rather', 'than', 'pushing', 'for', 'privacy', 'that',
		'is', 'no', 'privacy,', 'we', 'demanded', 'public', 'rights—the',
		'right', 'to', 'be', 'exposed,', 'to', 'take', 'risks',
		'and', 'to', 'be', 'in', 'public', 'and', 'not',
		'be', 'attacked?' ]

	const result = array.map((string) => {
		return helpers.stringToNumber(string, max)
	})

	const expectedResult = [ 100, 0, 100, 32, 100, 36, 32, 0, 0, 0, 0, 100,
		0, 4, 96, 96, 0, 96, 36, 36, 64, 32, 64, 64, 0, 100, 0, 68, 0,
		0, 96, 36, 0, 36, 0, 0, 68, 0, 0, 100, 0, 68, 0, 64, 0, 68,
		64, 0, 4, 0, 64, 0, 68, 96, 0, 0, 96, 0, 68, 32, 0, 68, 64, 4,
		0, 0, 64, 4, 0, 0, 68, 0, 68, 0, 0, 100, 0, 4, 36, 0, 0, 0,
		96, 0, 100, 0, 36, 0, 68, 4, 0, 0, 68, 100, 68, 68, 64, 36, 0,
		100, 4, 0, 32, 32, 96, 0, 0, 4, 0, 68, 32, 96, 36, 32, 68, 0,
		96, 36, 68, 0, 0, 0, 0, 36, 0, 32, 68, 36, 0, 64, 0, 64, 0,
		32, 68, 96, 0, 100, 96, 0, 0, 0, 64, 0, 96, 0, 68, 0, 4, 96,
		36, 96, 68, 100, 100, 0, 36, 68, 68, 100, 0, 0, 64, 0, 4, 0,
		0, 32, 32, 0, 0, 64, 36, 96, 36, 36, 0, 0, 68, 0, 64, 96, 64,
		68, 0, 0, 32, 0, 100, 36, 0, 4, 4, 36, 0, 100, 64, 32, 0, 36,
		0, 0, 100, 0, 100, 0, 96, 36, 4, 96, 0, 4, 0, 0, 0, 36, 0, 0,
		68, 0, 4, 32, 32, 0, 0, 68, 0, 4, 100, 36, 32, 68, 68, 0, 4,
		32, 96, 0, 100, 36, 0, 0, 36, 0, 32, 36, 68, 64, 0, 0, 4, 0,
		4, 100, 0, 0, 0, 0, 36, 0, 0, 0, 4 ]

	result.forEach((number) => {
		test.true(number <= max)
	})

	test.deepEqual(result, expectedResult)
})

ava('checkFieldAgainstOmissions matches field schemas against those to be omitted', async (test) => {
	const omissions = [ {
		key: 'pattern'
	}, {
		key: 'format',
		value: 'mermaid'
	}, {
		key: 'format',
		value: 'markdown'
	}, {
		field: 'version'
	} ]

	const firstSchema = {
		type: 'string',
		pattern: 'fake-pattern'
	}

	const secondSchema = {
		type: 'string',
		format: 'mermaid'
	}

	const thirdSchema = {
		type: 'string',
		format: 'markdown'
	}

	test.true(helpers.checkFieldAgainstOmissions(firstSchema, '', omissions))
	test.true(helpers.checkFieldAgainstOmissions(secondSchema, '', omissions))
	test.true(helpers.checkFieldAgainstOmissions(thirdSchema, '', omissions))
	test.true(helpers.checkFieldAgainstOmissions({}, 'version', omissions))
})

ava('When there are both and key and value present in the omission, checkFieldAgainstOmissions' +
	' only returns true when the field schema matches both the key and the value', (test) => {
	const omissions = [ {
		key: 'length',
		value: 5
	} ]

	const firstSchema = {
		type: 'string',
		length: 4
	}

	const secondSchema = {
		type: 'string',
		length: 5
	}

	test.false(helpers.checkFieldAgainstOmissions(firstSchema, 'fakeFieldName', omissions))
	test.true(helpers.checkFieldAgainstOmissions(secondSchema, 'fakeFieldName', omissions))
})

ava('getMessageMetaData ignores tokens in code blocks and inline code', async (test) => {
	const defaultExpectedTokens = [ '0', '2', '4' ]
	const defaultMetaData = {
		mentionsUser: [],
		alertsUser: [],
		mentionsGroup: [],
		alertsGroup: [],
		tags: []
	}
	const generateMessage = (tokenPrefix) => {
		return [
			`Testing ${tokenPrefix}0}`,
			'```',
			`Code block 1 ${tokenPrefix}1}`,
			'```',
			`Testing ${tokenPrefix}2`,
			'```',
			`Code block 2 ${tokenPrefix}3`,
			'```',
			`Testing ${tokenPrefix}4`,
			`Inline code \`y = 0; ${tokenPrefix}5\``
		].join('\n')
	}
	const testToken = (tokenPrefix, metaDataField, expectedTokens = defaultExpectedTokens) => {
		const metaData = helpers.getMessageMetaData(generateMessage(tokenPrefix))
		const expectedMetaData = {
			...defaultMetaData,
			[metaDataField]: expectedTokens
		}
		test.deepEqual(metaData, expectedMetaData)
	}
	const withUserPrefix = (token) => {
		return `user-${token}`
	}
	testToken('#', 'tags')
	testToken('@', 'mentionsUser', defaultExpectedTokens.map(withUserPrefix))
	testToken('!', 'alertsUser', defaultExpectedTokens.map(withUserPrefix))
	testToken('@@', 'mentionsGroup')
	testToken('!!', 'alertsGroup')
})

ava('checkFieldAgainstOmissions returns false when field schema do not match those to be omitted', async (test) => {
	const omissions = [ {
		key: 'pattern'
	}, {
		key: 'format',
		value: 'mermaid'
	}, {
		key: 'format',
		value: 'markdown'
	} ]

	const schema = {
		type: 'string',
		const: 'user@1.0.0'
	}

	test.false(helpers.checkFieldAgainstOmissions(schema, 'type', omissions))
})

ava('getPathsInSchema returns the title and path for each field in our schema. ' +
'Each path is represented as an array with a string value for each step through the schema. ' +
	'Title defaults to the key of the field  when there is no title in the schema', (test) => {
	const schema = {
		properties: {
			type: {
				title: 'type title',
				const: 'string'
			},
			data: {
				type: 'object',
				properties: {
					email: {
						type: 'string'
					},
					profile: {
						type: 'object',
						properties: {
							name: {
								type: 'object',
								properties: {
									firstname: {
										type: 'string'
									},
									lastname: {
										type: 'string'
									}
								}
							},
							username: {
								type: 'string'
							}
						}
					}
				}
			}
		}
	}

	const expectedResults = [
		{
			title: 'type title',
			path: [ 'type' ]
		},
		{
			title: 'email',
			path: [ 'data', 'email' ]
		},
		{
			title: 'username',
			path: [ 'data', 'profile', 'username' ]
		},
		{
			title: 'firstname',
			path: [ 'data', 'profile', 'name', 'firstname' ]
		},
		{
			title: 'lastname',
			path: [ 'data', 'profile', 'name', 'lastname' ]
		}
	]

	const actualResults = helpers.getPathsInSchema(schema, [])

	test.deepEqual(expectedResults, actualResults)
})

ava('getPathsInSchema omits fields that match the omissions schema', (test) => {
	const schema = {
		properties: {
			type: {
				const: 'string'
			},
			data: {
				type: 'object',
				properties: {
					email: {
						type: 'string'
					},
					profile: {
						type: 'object',
						properties: {
							name: {
								type: 'object',
								properties: {
									firstname: {
										type: 'string',
										format: 'markdown'
									},
									lastname: {
										pattern: 'fake-pattern'
									}
								}
							},
							username: {
								type: 'string',
								length: 5
							}
						}
					}
				}
			}
		}
	}

	const omissions = [ {
		key: 'pattern'
	},
	{
		key: 'format',
		value: 'markdown'
	}, {
		key: 'length'
	}, {
		field: 'type'
	}, {
		field: 'email'
	} ]

	const actualResults = helpers.getPathsInSchema(schema, omissions)

	test.deepEqual(actualResults, [])
})

ava('isRelativeUrl does not match absolute URLs', (test) => {
	const host = 'example.com'
	test.false(helpers.isRelativeUrl('https://example.com/test', host))
})

ava('isRelativeUrl matches relative URLs', (test) => {
	const host = 'example.com'
	test.true(helpers.isRelativeUrl('/test', host))
})

ava('isLocalUrl matches URLs on the same domain', (test) => {
	test.true(helpers.isLocalUrl(`http://${window.location.host}/test`))
	test.true(helpers.isLocalUrl(`https://${window.location.host}/test`))
	test.true(helpers.isLocalUrl(`https://www.${window.location.host}/test`))
})

ava('isLocalUrl does not match relative URLs', (test) => {
	test.false(helpers.isLocalUrl('/test'))
})

ava('isLocalUrl does not match external URLs', (test) => {
	test.false(helpers.isLocalUrl('http://other.com/test'))
	test.false(helpers.isLocalUrl('https://other.com/test'))
	test.false(helpers.isLocalUrl('https://www.other.com/test'))
})

ava('toRelativeUrl converts absolute URLs to relative URLs', (test) => {
	test.is(helpers.toRelativeUrl('http://example.com/test'), '/test')
	test.is(helpers.toRelativeUrl('https://example.com/test?a=b'), '/test?a=b')
	test.is(helpers.toRelativeUrl('http://www.example.com/test'), '/test')
})

ava('getTypesFromViewCard returns the const type defined in a view card\'s allOf', (test) => {
	test.deepEqual(
		helpers.getTypesFromViewCard({
			slug: 'view-1',
			type: 'view@1.0.0',
			data: {
				allOf: [
					{
						schema: {
							type: 'object',
							properties: {
								type: {
									type: 'string',
									const: 'type1@1.0.0'
								}
							}
						}
					}
				]
			}
		}),
		[ 'type1@1.0.0' ]
	)
})

ava('getTypesFromViewCard returns the enum types defined in a view card\'s allOf', (test) => {
	test.deepEqual(
		helpers.getTypesFromViewCard({
			slug: 'view-1',
			type: 'view@1.0.0',
			data: {
				allOf: [
					{
						schema: {
							type: 'object',
							properties: {
								type: {
									type: 'string',
									enum: [
										'type1@1.0.0',
										'type2@1.0.0'
									]
								}
							}
						}
					}
				]
			}
		}),
		[ 'type1@1.0.0', 'type2@1.0.0' ]
	)
})

ava('getTypesFromViewCard returns the enum types defined in an anyOf within a view card\'s allOf', (test) => {
	test.deepEqual(
		helpers.getTypesFromViewCard({
			slug: 'view-1',
			type: 'view@1.0.0',
			data: {
				allOf: [
					{
						schema: {
							anyOf: [
								{
									type: 'object',
									properties: {
										type: {
											type: 'string',
											enum: [
												'type1@1.0.0',
												'type2@1.0.0'
											]
										}
									}
								}
							]
						}
					}
				]
			}
		}),
		[ 'type1@1.0.0', 'type2@1.0.0' ]
	)
})

ava('getTypesFromViewCard returns the const type defined in a view card\'s oneOf', (test) => {
	test.deepEqual(
		helpers.getTypesFromViewCard({
			slug: 'view-1',
			type: 'view@1.0.0',
			data: {
				oneOf: [
					{
						schema: {
							type: 'object',
							properties: {
								type: {
									type: 'string',
									const: 'type1@1.0.0'
								}
							}
						}
					}
				]
			}
		}),
		[ 'type1@1.0.0' ]
	)
})

ava('getTypesFromViewCard returns the enum types defined in a view card\'s oneOf', (test) => {
	test.deepEqual(
		helpers.getTypesFromViewCard({
			slug: 'view-1',
			type: 'view@1.0.0',
			data: {
				oneOf: [
					{
						schema: {
							type: 'object',
							properties: {
								type: {
									type: 'string',
									enum: [
										'type1@1.0.0',
										'type2@1.0.0'
									]
								}
							}
						}
					}
				]
			}
		}),
		[ 'type1@1.0.0', 'type2@1.0.0' ]
	)
})

ava('getMergedSchemas merges the schemas of two type cards', (test) => {
	const mergedSchema = helpers.getMergedSchema({
		type: 'type@1.0.0',
		data: {
			schema: {
				type: 'object',
				properties: {
					status: {
						type: 'string'
					}
				}
			}
		}
	},
	{
		type: 'type@1.0.0',
		data: {
			schema: {
				type: 'object',
				properties: {
					category: {
						type: 'string'
					}
				}
			}
		}
	})
	test.deepEqual(mergedSchema, {
		type: 'object',
		additionalProperties: true,
		properties: {
			status: {
				type: 'string'
			},
			category: {
				type: 'string'
			}
		}
	})
})
