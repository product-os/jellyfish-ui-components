import { core } from '@balena/jellyfish-types';

export type Channel = core.Contract<{
	target: string;
}>;

export interface JSONPatch {
	op: 'add' | 'remove' | 'replace';
	path: string[] | string;
	value: any;
}
