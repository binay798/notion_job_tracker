export function convertPgArrToJsArr(data: string) {
  return data.replace(/[{}]/g, '').replace(/[{}]/g, '').split(',');
}
