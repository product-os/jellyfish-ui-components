import React from 'react';
import _ from 'lodash';
import { Box } from 'rendition';
import { createTemplate, createStory } from '../../.storybook/utils';
import { UserAvatar } from './index';

const FULL_USER = {
	slug: 'user-johndoe',
	data: {
		email: 'john.doe@example.com',
		avatar: 'https://i.pravatar.cc/150?img=3',
		profile: {
			name: {
				first: 'John',
				last: 'Doe',
			},
		},
	},
};

export default {
	title: 'Examples/UserAvatar',
	component: UserAvatar,
	decorators: [
		(Story) => {
			return (
				<Box pt="50px" pl="50px" display="inline-block">
					<Story />
				</Box>
			);
		},
	],
};

const Template = createTemplate(UserAvatar);

export const Default = createStory(Template, {
	user: FULL_USER,
});

export const WithoutAvatar = createStory(Template, {
	user: _.merge({}, FULL_USER, {
		data: {
			avatar: '',
		},
	}),
});

export const WithoutEmail = createStory(Template, {
	user: _.merge({}, FULL_USER, {
		data: {
			email: '',
		},
	}),
});

export const WithoutName = createStory(Template, {
	user: _.merge({}, FULL_USER, {
		data: {
			profile: null,
		},
	}),
});

export const Emphasized = createStory(Template, {
	user: FULL_USER,
	emphasized: true,
});
