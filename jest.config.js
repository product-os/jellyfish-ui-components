const base = require('@balena/jellyfish-config/config/jest.config')

module.exports = {
	...base,
	testEnvironment: 'jsdom',
	transform: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|css)$':
		  '<rootDir>/file-transformer.js',
	},
	setupFiles: ['<rootDir>/test/browser-setup.ts']
};
