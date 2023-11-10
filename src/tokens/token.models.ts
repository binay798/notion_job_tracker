import { Model } from '../db';

const TABLE_NAME = 'tokens';
export class TokenModel extends Model<TokenModel> {
  get tableName() {
    return TABLE_NAME;
  }
}
