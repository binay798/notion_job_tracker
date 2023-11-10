import { Model } from '../db';

export const TABLE_NAME = 'users';

export class UserModel extends Model<UserModel> {
  get tableName() {
    return TABLE_NAME;
  }
}
