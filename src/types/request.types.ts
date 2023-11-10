import { User } from './user.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      decoded?: User;
      files?: { images: [] };
      images?: [];
      uploadDir?: string;
      file: object;
    }
  }
}
