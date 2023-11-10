import { bookshelf } from '../db';

const getNextSeq = (table: string) => {
  const query = `SELECT nextval(pg_get_serial_sequence('public.${table}', 'id')::regclass);`;

  return bookshelf.knex.raw(query).then((data) => data.rows[0].nextval);
};

export default getNextSeq;
