import Boom from '@hapi/boom';
import { TABLE } from '../config/global.constants';
import { Knex, Transaction } from '../db';
import { isEmpty } from 'lodash';

type TableType = keyof typeof TABLE;
export const insertIntoDB = <T, U>(tableName: TableType, data: T, transx?: Transaction) => {
  if (transx) {
    return Knex(tableName)
      .insert(data)
      .transacting(transx)
      .returning('*')
      .then((res) => res[0]) as Promise<U>;
  }

  return Knex(tableName)
    .insert(data)
    .returning('*')
    .then((res) => res[0]) as Promise<U>;
};

export const updateTableOfDB = <T, U>(
  tableName: TableType,
  data: Partial<T>,
  updatedDetails: Partial<T>,
  transx?: Transaction
) => {
  if (transx) {
    return Knex(tableName)
      .where(data)
      .update(updatedDetails)
      .returning('*')
      .transacting(transx)
      .then((res) => res[0]) as Promise<U>;
  }

  return Knex(tableName)
    .where(data)
    .update(updatedDetails)
    .returning('*')
    .then((res) => res[0]) as Promise<U>;
};

export const deleteFromDB = <T extends object>(tableName: TableType, data: T, transx?: Transaction) => {
  if (transx) {
    return Knex(tableName).where(data).del().transacting(transx);
  }

  return Knex(tableName).where(data).del();
};

/**
 * Execute raw parametrized query.
 *
 **/
export const executeRawQuery = (query: string, bindings: (string | number)[] = [], transx?: Transaction) => {
  if (transx) {
    return Knex.raw(query, bindings).transacting(transx);
  }

  return Knex.raw(query, bindings);
};

export function executeRawQueryToGetFirstRow<T>(
  query: string,
  bindings: (string | number)[] = [],
  transx?: Transaction
) {
  return executeRawQuery(query, bindings, transx).then<T>((res) => res.rows[0]);
}

export const bulkInsertIntoDB = <T, U>(tableName: TableType, data: T[], transx?: Transaction) => {
  if (transx) {
    return Knex(tableName).insert(data).transacting(transx).returning('*') as Promise<U[]>;
  }

  return Knex(tableName).insert(data).returning('*') as Promise<U[]>;
};

export const bulkDeleteRows = (tableName: TableType, rowIds: number[], transx?: Transaction) => {
  const query = `DELETE FROM ${tableName} WHERE id IN (${Array(rowIds.length).fill('?').join(',')})`;

  return executeRawQuery(query, rowIds, transx);
};

export class CommonDbEntity<BaseType, CreateType> {
  // @ts-ignore
  tableName: TableType = '';
  constructor(tableName: TableType) {
    this.tableName = tableName;
  }

  getById = (id: number, transx?: Transaction) => {
    const query = Knex.select('*').from(this.tableName).where({ id });

    return (transx ? query.transacting(transx) : query).then((res) => {
      if (isEmpty(res)) {
        throw Boom.notFound('Entity doesnot exits.');
      }

      return res[0] as BaseType;
    });
  };

  create = (data: CreateType, transx?: Transaction) => {
    return insertIntoDB<CreateType, BaseType>(this.tableName, data, transx);
  };

  update = (id: number, data: Partial<CreateType>, transx?: Transaction) => {
    // @ts-ignore
    return updateTableOfDB<CreateType, BaseType>(this.tableName, { id }, data, transx);
  };

  delete = (id: number, transx?: Transaction) => {
    return deleteFromDB(this.tableName, { id }, transx);
  };

  bulkCreate = (data: CreateType[], transx?: Transaction) => {
    const query = Knex(this.tableName).insert(data);

    return transx ? query.transacting(transx) : query;
  };
}
