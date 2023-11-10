import { UserModel } from './user.models';
import Boom from '@hapi/boom';
import { User } from '../types/user.types';
import { hashPassword } from '../utils/hashPassword';
import { pagination } from '../utils/pagination';
import { deleteFromDB, insertIntoDB, updateTableOfDB } from '../utils/dbTransaction';
import { Transaction } from 'knex';

export const createUser = (data: User, transx?: Transaction) => {
  const model = new UserModel(data);

  return insertIntoDB(model, transx);
};

export const getUserByEmail = (email: string) => {
  return new UserModel()
    .where('email', email)
    .fetch()
    .then((user: UserModel) => user.toJSON())
    .catch(() => {
      throw Boom.badRequest('User not found');
    });
};

export const doesUserExist = (email: string) => {
  return new UserModel()
    .where('email', email)
    .fetch()
    .then((user: UserModel) => user.toJSON())
    .catch(() => {
      return null;
    });
};

export const getUserById = (id: number) => {
  return new UserModel({ id })
    .fetch()
    .then((user: UserModel) => user.toJSON())
    .catch(() => {
      throw Boom.notFound('User not found');
    });
};

export const deleteUserById = (id: number, transx?: Transaction) => {
  const model = new UserModel({ id });

  return deleteFromDB(model, transx);
};

export const getAllUsers = (fields: string, page: number, limit: number) => {
  const userTable = new UserModel().tableName;
  const query = `SELECT count(*) OVER() AS total_count, ${fields ? fields : '*'} FROM ${userTable};`;

  return pagination(query, page, limit);
};

export const updateUser = (id: number, data: Partial<User>, transx?: Transaction) => {
  delete data.password;
  delete data.role;

  const model = new UserModel({ id });

  return updateTableOfDB(model, data, transx);
};

export const changeUserPassword = (id: number, password: string, transx?: Transaction) => {
  return hashPassword(password)
    .then((result: string) => {
      const model = new UserModel({ id });

      return updateTableOfDB(model, { password: result }, transx);
    })
    .catch(() => {
      throw Boom.badRequest('Password not changed');
    });
};
