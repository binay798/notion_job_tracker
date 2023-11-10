import path from 'path';

export const PUBLIC_PATH = path.join(process.env.ROOT_PATH as string, process.env.PUBLIC_PATH as string);
export const ROLE = {
  user: 'user',
  admin: 'admin',
  all: ['user', 'admin'],
};
