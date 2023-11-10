import fs from 'fs';
import Boom from '@hapi/boom';
import * as childProcess from 'child_process';
// import logger from './logger';
import mime from 'mime-types';
import path from 'path';
import PersistentFile from 'formidable/PersistentFile';
import mv from 'mv';

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const moveUploadedFiles = async (
  uploadedFiles: PersistentFile[] = [],
  fileSysDir: string,
  dbPath: string
): Promise<string[]> => {
  try {
    const dbImage = [];
    const randomInt = getRandomInt(1000);
    for (let i = 0; i < uploadedFiles.length; i++) {
      // @ts-ignore
      const extension = mime.extension(uploadedFiles[i].mimetype);

      if (extension) {
        const fileName = `${Date.now() + randomInt + i}.${extension}`;

        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        await moveFiles(uploadedFiles[i].filepath, path.join(fileSysDir, fileName));
        dbImage.push(path.join(dbPath, fileName));
      }
    }

    return Promise.resolve(dbImage);
  } catch (err) {
    throw Boom.badRequest('Images not moved');
  }
};

export const moveFiles = (oldPath: string, newPath: string) => {
  return new Promise((resolve, reject) => {
    const exists = fs.existsSync(oldPath);
    if (!exists) {
      reject(Boom.notFound('Images not uploaded. Try again.'));
    } else {
      mv(oldPath, newPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    }
  });
};

export const deleteFolder = (path: string, throwErr = true) => {
  return new Promise((resolve, reject) => {
    path = path.replace(/\s+/gi, '');
    const exists = fs.existsSync(path);
    if (!exists) {
      if (!throwErr) {
        return resolve({});
      }

      return reject(new Error(`Given path doesnt exist. -> ${path}`));
    } else {
      childProcess.exec(`rmdir /s /q ${path}`);

      return resolve({ path });
    }
  });
};
