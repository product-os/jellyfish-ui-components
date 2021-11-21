import _ from 'lodash';
import getUsers from './get-users';
import { username } from '../../../../services/helpers';
import { JellyfishSDK } from '@balena/jellyfish-client-sdk';
import { core } from '@balena/jellyfish-types';

const getFullName = (data: core.UserData) => {
	const firstName = _.get(data, ['profile', 'name', 'first']);
	const lastName = _.get(data, ['profile', 'name', 'last']);
	const fullName = _.join([firstName, lastName], ' ').trim();
	return _.isEmpty(fullName) ? '' : `(${fullName})`;
};

const findMatchingUsers = async (
	user: core.UserContract,
	sdk: JellyfishSDK,
	token: string,
) => {
	if (!token) {
		return [];
	}
	const users = await getUsers(user, sdk, token);
	const usernames = users.map(({ slug, data }) => {
		return {
			slug: `${username(slug)}`,
			name: getFullName(data),
		};
	});

	return usernames;
};

export default findMatchingUsers;
