import knex from 'knex';
import * as knexConfig from './knexfile';
import Boom from '@hapi/boom';

const _knex = knex(knexConfig);

const x = _knex.transaction().catch(() => {
  throw Boom.badData('Database connection issue.');
});
x.then((res) => res.commit());
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type Transaction = UnwrapPromise<typeof x>;

export const Knex = _knex;
