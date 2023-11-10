import { Transaction } from 'knex';
import { bookshelf } from '../db';
import Bookshelf from 'bookshelf';

/**
 * Bookshelf model insert with transaction.
 *
 **/
export const insertIntoDB = <T extends Bookshelf.Model<T>>(model: T, transx?: Transaction) => {
  if (transx) {
    return model.save(undefined, { transacting: transx });
  }

  return model.save();
};

/**
 * Bookshelf model update with transaction.
 *
 **/
export const updateTableOfDB = <T extends Bookshelf.Model<T>, MD extends { [key: string]: any }>(
  model: T,
  updateDetails: MD,
  transx?: Transaction
) => {
  if (transx) {
    return model.save(updateDetails, { transacting: transx });
  }

  return model.save(updateDetails);
};

/**
 * Bookshelf model delete with transaction.
 *
 **/
export const deleteFromDB = <T extends Bookshelf.Model<T>>(model: T, transx?: Transaction) => {
  if (transx) {
    return model.destroy({ transacting: transx });
  }

  return model.destroy();
};

/**
 * Execute raw parametrized query.
 *
 **/
export const executeRawQuery = (query: string, bindings: (string | number)[] = [], transx?: Transaction) => {
  if (transx) {
    return bookshelf.knex.raw(query, bindings).transacting(transx);
  }

  return bookshelf.knex.raw(query, bindings);
};
