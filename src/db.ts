import knex from 'knex';
import _bookshelf from 'bookshelf';
import * as knexConfig from './knexfile';

const _knex = knex(knexConfig);
export const bookshelf = _bookshelf(_knex);
export const Model = bookshelf.Model;
