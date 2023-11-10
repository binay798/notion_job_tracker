import { executeRawQuery } from './dbTransaction';

export const pagination = (query: string, page = 1, limit = 10, bindings: (string | number)[] = []) => {
  if (!page) {
    page = 1;
  }
  if (!limit) {
    limit = 10;
  }
  const offsetPagination = (page - 1) * limit;
  query = `${query} LIMIT ? OFFSET ? ;`;
  bindings.push(...[limit, offsetPagination]);

  return executeRawQuery(query, bindings).then((finalResult) => {
    return {
      total: finalResult.rows.length ? finalResult.rows[0].total_count : 0,
      rows: finalResult.rows,
      isLast: finalResult.rows.length ? (page * limit < finalResult.rows[0].total_count ? false : true) : true,
    };
  });
};
