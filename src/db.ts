import knex from 'knex';
import * as knexConfig from './knexfile';

const _knex = knex(knexConfig);

const x = _knex.transaction();
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type Transaction = UnwrapPromise<typeof x>;

export const Knex = _knex;
