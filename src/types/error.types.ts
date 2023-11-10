export interface ResponseError {
  isJoi: boolean;
  isBoom: boolean;
  output: { statusCode: number; payload: { message: string; error: string } };
  detail: string;
  message: string;
  details: { message: string; path: string[] }[];
  name: string;
  column: string;
  code: number;
  status: number;
  stack: string;
}
