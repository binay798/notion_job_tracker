/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from 'knex';
import { bookshelf } from '../db';
import Bookshelf from 'bookshelf';
import Boom from '@hapi/boom';
import { isEmpty } from 'lodash';

/**
 * Bookshelf model insert with transaction.
 *
 **/
export const insertIntoDB = <T>(model: Bookshelf.Model<any>, transx?: Transaction) => {
  if (transx) {
    return model.save(undefined, { transacting: transx }).then((result) => result.toJSON()) as Promise<T>;
  }

  return model.save().then((result) => result.toJSON()) as Promise<T>;
};

/**
 * Bookshelf model update with transaction.
 *
 **/
export const updateTableOfDB = <T>(model: Bookshelf.Model<any>, updateDetails: Partial<T>, transx?: Transaction) => {
  if (transx) {
    return model.save(updateDetails, { transacting: transx }).then((result) => result.toJSON()) as Promise<T>;
  }

  return model.save(updateDetails).then((result) => result.toJSON()) as Promise<T>;
};

/**
 * Bookshelf model delete with transaction.
 *
 **/
export const deleteFromDB = <T>(model: Bookshelf.Model<any>, transx?: Transaction) => {
  if (transx) {
    return model.destroy({ transacting: transx });
  }

  return model.destroy().then((res) => res.toJSON()) as Promise<T>;
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

export function executeRawQueryToGetFirstRow<T>(
  query: string,
  bindings: (string | number)[] = [],
  transx?: Transaction
) {
  return (
    executeRawQuery(query, bindings, transx)
      // .debug(true)
      .then<T>((res) => res.rows[0])
  );
}

/**
 * Bookshelf collection insert with transaction.
 *
 **/
export const bulkInsertIntoDB = <T extends Bookshelf.Model<T>>(
  collection: Bookshelf.Collection<T>,
  transx?: Transaction
) => {
  if (transx) {
    return collection.invokeThen('save', undefined, { transacting: transx });
  }

  return collection.invokeThen('save');
};

/**
 * Bookshelf collection update with transaction.
 *
 **/
export const bulkUpdateRowsOfTable = <T extends Bookshelf.Model<T>>(
  collection: Bookshelf.Collection<T>,
  transx?: Transaction
) => {
  if (transx) {
    return collection.invokeThen('save', undefined, {
      transacting: transx,
      method: 'update',
    });
  }

  return collection.invokeThen('save');
};

/**
 * Bookshelf collection delete with transaction.
 *
 **/
export const bulkDeleteRowsOfTable = <T extends Bookshelf.Model<T>>(
  collection: Bookshelf.Collection<T>,
  transx?: Transaction
) => {
  if (transx) {
    return collection.invokeThen('destroy', undefined, { transacting: transx });
  }

  return collection.invokeThen('destroy');
};

export const getDataOfTableByRowId = <T>(tableName: string, rowId: number, cols: string[]) => {
  const query = `SELECT ${cols.join(',')} FROM ${tableName} WHERE id=?;`;

  return executeRawQueryToGetFirstRow<T>(query, [rowId]);
};
export const getDataOfTableByRowIds = <T>(
  tableName: string,
  rowIds: number[],
  cols: string[],
  validate?: object,
  transx?: Transaction
) => {
  const bindings: (number | string)[] = [...rowIds];
  let validationStr = '';
  if (!isEmpty(validate)) {
    const data = Object.keys(validate)
      // @ts-ignore
      .filter((el) => validate[el] !== null)
      .map((el) => `${el} = ?`)
      .join(' AND ');
    if (!isEmpty(data)) {
      validationStr = validationStr.concat(' AND ', data);
    }
    bindings.push(
      // @ts-ignore
      ...Object.values<string | number>(validate).filter((el) => el !== null)
    );
  }
  // for null
  if (!isEmpty(validate)) {
    const data = Object.keys(validate)
      // @ts-ignore
      .filter((el) => validate[el] === null)
      .map((el) => `${el} IS NULL`)
      .join(' AND ');
    if (!isEmpty(data)) {
      validationStr = validationStr.concat(' AND ', data);
    }
  }
  const query = `SELECT ${cols.join(',')} FROM ${tableName} WHERE id IN (${Array(rowIds.length).fill(
    '?'
  )}) ${validationStr};`;

  return executeRawQuery(query, bindings, transx).then<T>((res) => res.rows);
};

export const convertModelsToJson = <T>(models: Bookshelf.Model<any>[]) => {
  return models.map((el) => el.toJSON()) as T[];
};

export const bulkDeleteRows = (tableName: string, rowIds: number[], transx?: Transaction) => {
  const query = `DELETE FROM ${tableName} WHERE id IN (${Array(rowIds.length).fill('?').join(',')})`;

  return executeRawQuery(query, rowIds, transx);
};

/**
 * Implement basic CRUD operation with this class
 * BaseType : Base interface of the table entity MARK: required
 * CreateType : Interface that is used for creating any entity MARK: required
 *
 * for eg:
 * const projectEntity = new CommonDbEntity<IProjects, TCreateProject>(ProjectModal)
 */
export class CommonDbEntity<BaseType, CreateType> {
  private model: typeof Bookshelf.Model<any> | null = null;
  constructor(entity: typeof Bookshelf.Model<any>) {
    this.model = entity;
  }

  getById = (id: number, transx?: Transaction) => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }

    return new this.model({ id })
      .fetch({
        require: false,
        transacting: transx,
      })
      .then<BaseType>((res) => {
        if (!res) {
          throw Boom.notFound('Entity doesnot exist.');
        }

        return res.toJSON();
      });
  };

  create = (data: CreateType, transx?: Transaction) => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }

    return insertIntoDB<BaseType>(new this.model(data), transx);
  };

  update = (id: number, data: Partial<CreateType>, transx?: Transaction) => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }
    // @ts-ignore

    return updateTableOfDB<BaseType>(new this.model({ id }), data, transx);
  };

  delete = (id: number, transx?: Transaction) => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }

    return deleteFromDB<BaseType>(new this.model({ id }), transx);
  };

  validateRowData = (
    entity: BaseType,
    data: { colname: keyof BaseType; value: any },
    fulfillDataConstraint: boolean,
    errMsg: string
  ) => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }
    const colData = entity[data.colname];
    if (fulfillDataConstraint) {
      if (colData !== data.value) {
        throw Boom.badRequest(errMsg);
      }

      return true;
    } else {
      if (colData === data.value) {
        throw Boom.badRequest(errMsg);
      }

      return true;
    }
  };

  filterData = (data: { [Property in keyof Partial<BaseType>]: any }): Promise<BaseType[]> => {
    if (!this.model) {
      throw Boom.badRequest('Invalid entity.');
    }

    return new this.model()
      .where(data)
      .fetchAll({ require: false })
      .then((res: Bookshelf.Model<any>[]) => convertModelsToJson<BaseType>(res));
  };
}
