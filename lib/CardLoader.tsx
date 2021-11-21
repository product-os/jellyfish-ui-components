import React from 'react';
import { useSelector } from 'react-redux';
import { core } from '@balena/jellyfish-types';

interface CardLoaderContextValue {
	getCard: any;
	selectCard: <TCard extends core.Contract>(
		id: string,
		type: string,
	) => (state: any) => TCard;
}

export const CardLoaderContext =
	React.createContext<CardLoaderContextValue | null>(null);

interface CardLoaderProps<TCard extends core.Contract> {
	id: string;
	type: string;
	withLinks?: string[];
	children: (card: TCard) => JSX.Element;
}

export const CardLoader = <TCard extends core.Contract = core.Contract>({
	id,
	type,
	withLinks,
	children,
}: React.PropsWithChildren<CardLoaderProps<TCard>>) => {
	if (typeof children !== 'function') {
		throw new Error('CardLoader only accepts a function as a child');
	}
	const { getCard, selectCard } = React.useContext(CardLoaderContext)!;
	if (!getCard || !selectCard) {
		throw new Error(
			'CardLoaderContext not found. Did you forget to provide a CardLoaderContext.Provider in the element heirarchy?',
		);
	}
	const card = useSelector((state) => {
		return selectCard<TCard>(id, type)(state);
	});
	React.useEffect(() => {
		if (!card) {
			getCard(id, type, withLinks);
		}
	}, [id]);
	return children ? children(card) : null;
};
