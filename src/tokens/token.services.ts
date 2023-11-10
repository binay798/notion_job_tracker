import crypto from 'crypto';
import Boom from '@hapi/boom';
import { TokenModel } from './token.models';
import logger from '../utils/logger';
import { Transaction } from 'knex';
import { deleteFromDB, executeRawQuery, insertIntoDB } from '../utils/dbTransaction';

export const createToken = (userId: number, transx?: Transaction) => {
  const token = crypto.randomBytes(16).toString('hex');
  const model = new TokenModel({ value: token, user_id: userId });

  return insertIntoDB(model, transx)
    .then((result) => result.toJSON())
    .catch((err) => {
      if (err.constraint === 'tokens_user_id_unique') {
        return upsertCreateToken(token, userId, transx);
      }
      logger.error(err);
      throw Boom.badRequest('Token not created');
    });
};

export const upsertCreateToken = (token: string, userId: number, transx?: Transaction) => {
  return executeRawQuery(
    ` INSERT INTO tokens(value, userId)
      VALUES('${token}', ${userId})
      ON CONFLICT (userId)
      DO
        UPDATE SET value='${token}' RETURNING *;
    `,
    [],
    transx
  ).then((result) => result.rows[0]);
};

export const findByToken = (token: string) => {
  return new TokenModel()
    .where('value', token)
    .fetch()
    .then((result) => result)
    .catch(() => {
      throw Boom.notFound('Token not found');
    });
};

export const deleteTokenById = (id: number, transx?: Transaction) => {
  const model = new TokenModel({ id });

  return deleteFromDB(model, transx);
};
