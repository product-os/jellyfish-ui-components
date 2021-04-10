/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { JellyfishSDK } from '@balena/jellyfish-client-sdk';
import { core } from '@balena/jellyfish-types';
import _ from 'lodash';

const getUsers = async (
	user: core.UserContract,
	sdk: JellyfishSDK,
	value: string,
) => {
	// @ts-ignore
	const orgsOfCurrentUser = _.map(user.links['is member of'], 'slug');

	const matchingUsersInOrg = await sdk.query<core.UserContract>(
		{
			$$links: {
				'is member of': {
					type: 'object',
					properties: {
						slug: {
							enum: orgsOfCurrentUser,
						},
					},
				},
			},
			type: 'object',
			anyOf: [
				{
					required: ['slug'],
					properties: {
						slug: {
							// @ts-ignore
							regexp: {
								pattern: `^user-${value}`,
								flags: 'i',
							},
						},
					},
				},
				{
					required: ['type', 'data'],
					properties: {
						type: {
							const: 'user@1.0.0',
						},
						data: {
							type: 'object',
							required: ['profile'],
							properties: {
								profile: {
									type: 'object',
									required: ['name'],
									properties: {
										name: {
											type: 'object',
											anyOf: [
												{
													required: ['first'],
													properties: {
														first: {
															// @ts-ignore
															regexp: {
																pattern: `^${value}`,
																flags: 'i',
															},
														},
													},
												},
												{
													required: ['last'],
													properties: {
														last: {
															// @ts-ignore
															regexp: {
																pattern: `^${value}`,
																flags: 'i',
															},
														},
													},
												},
											],
										},
									},
								},
							},
						},
					},
				},
			],
			additionalProperties: true,
		},
		{
			limit: 10,
			sortBy: 'slug',
		},
	);
	return matchingUsersInOrg;
};

export default getUsers;