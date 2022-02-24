import type { Contract } from '@balena/jellyfish-types/build/core';

export type Channel = Contract<{
	target: string;
}>;

export interface JSONPatch {
	op: 'add' | 'remove' | 'replace';
	path: string[] | string;
	value: any;
}
