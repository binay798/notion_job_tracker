import changeCase from 'change-case-object';

export function formatSnakeCase<T>(obj: Record<string, string | number | string[] | T | null>) {
  return changeCase.snakeCase({ ...obj }) as T;
}
