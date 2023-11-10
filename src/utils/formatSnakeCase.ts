import changeCase from 'change-case-object';
import ld from 'lodash';

export function formatSnakeCase<T>(obj: Record<string, string | number | string[] | T | null | boolean>) {
  return changeCase.snakeCase({ ...obj }) as T;
}

export const rmFalsifyAttrOfObj = <T extends object>(data: T) => {
  return ld.omitBy<T>(data, ld.isNil);
};
