import bcrypt from 'bcrypt';
import Boom from '@hapi/boom';

export const hashPassword = (password: string) => {
  return bcrypt
    .hash(password, 10)
    .then((decoded: string) => decoded)
    .catch(() => {
      throw Boom.badRequest('Password not hashed');
    });
};
export const comparePassword = (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
