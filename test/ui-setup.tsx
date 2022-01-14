import React from 'react';
import _ from 'lodash';
import { Provider } from 'rendition';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider as ReduxProvider } from 'react-redux';
import { configure } from 'enzyme';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { CardLoaderContext } from '../lib/CardLoader';

import Adapter from 'enzyme-adapter-react-16';

const emotionCache = createCache({
	key: 'test',
});

configure({
	adapter: new Adapter(),
});

const middlewares: any[] = [];
const mockStore = configureStore(middlewares);

class HowlerGlobal {}
// @ts-ignore
global.HowlerGlobal = HowlerGlobal;

class Howl {}
// @ts-ignore
global.Howl = Howl;

class Sound {}
// @ts-ignore
global.Sound = Sound;

class Location {}
// @ts-ignore
global.location = Location;

// @ts-ignore
global.fetch = jest.fn(() => Promise.resolve());

window.HTMLElement.prototype.scrollIntoView = _.noop;

export const flushPromises = () => {
	return new Promise((resolve) => {
		return setImmediate(resolve);
	});
};

export const getPromiseResolver = () => {
	let resolver: ((value: unknown) => void) | null = null;
	const promise = new Promise((resolve) => {
		resolver = resolve;
	});
	return {
		promise,
		resolver,
	};
};

export const getWrapper = (
	initialState = {},
	cardLoader = {
		getCard: sinon.stub().returns(null),
		selectCard: sinon.stub().returns(sinon.stub().returns(null)),
	},
) => {
	const store = mockStore(initialState);
	return {
		store,
		wrapper: ({ children }: any) => {
			return (
				<CacheProvider value={emotionCache}>
					<MemoryRouter>
						<ReduxProvider store={store}>
							<Provider>
								<DndProvider backend={HTML5Backend}>
									<CardLoaderContext.Provider value={cardLoader}>
										{children}
									</CardLoaderContext.Provider>
								</DndProvider>
							</Provider>
						</ReduxProvider>
					</MemoryRouter>
				</CacheProvider>
			);
		},
	};
};
