export function convertJsonbToNullIfEveryKeysAreNull(jsonb: string) {
  return `NULLIF(jsonb_strip_nulls(${jsonb}), '{}')`;
}

export function generateCustomJsonBuild(tblAlias: string, data: string[]) {
  const cols = data.map((el) => `'${el}', ${tblAlias}.${el}`);

  return `jsonb_build_object(${cols.toString()})`;
}

export function stripNull(alias: string, jsonb: string) {
  return `
		CASE
			WHEN ${alias}.id IS NULL THEN NULL
			ELSE ${jsonb}
		END
	`;
}
