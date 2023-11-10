import fs from 'fs';
import Boom from '@hapi/boom';
import * as childProcess from 'child_process';
import mime from 'mime-types';
import path from 'path';
import mkdirp from 'mkdirp';
import PersistentFile from 'formidable/PersistentFile';
import mv from 'mv';
import fsPromise from 'fs/promises';
import logger from './logger';
import { isEmpty } from 'lodash';

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
      const extension = mime.extension(uploadedFiles[i].mimetype as string);

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

export const deleteFolder = (path: string) => {
  return new Promise((resolve, reject) => {
    path = path.replace(/\s+/gi, '');
    const exists = fs.existsSync(path);
    if (!exists) {
      reject(new Error(`Given path doesnt exist. -> ${path}`));
    } else {
      childProcess.exec(`rm -r ${path}`);

      return resolve({ path });
    }
  });
};

export const deleteMultipleFolders = (paths: string[]) => {
  if (!isEmpty(paths)) {
    return Promise.all(paths.map((el) => deleteFolder(el))).catch((err) => logger.error(err));
  }
};

/**
 * Convert base64 image to file
 *
 */
export const convertBase64ToImage = (base64Str: string, pathToUpload: string) => {
  const splited = base64Str.split(',');
  // Convert base64 to buffer
  const buffer = Buffer.from(splited.length > 1 ? splited[1] : splited[0], 'base64');
  // console.log(base64Str);

  // Pipes an image with filename as the name.
  return fsPromise.writeFile(pathToUpload, buffer);
};

export const deleteFile = async (filePath: string) => {
  if (fs.existsSync(filePath)) {
    await fsPromise.unlink(filePath);
  }
};

export const writeOnTempFile = (objectExtn: string, fileData: string | NodeJS.ArrayBufferView) => {
  const randomInt = getRandomInt(1000);
  const currentTime = `${Date.now() + randomInt}`;
  const tempFileRootFolder = path.join(process.env.TEMP_DIR as string, currentTime);
  const relativePath = path.join(currentTime, `${currentTime}.${objectExtn}`);
  mkdirp.sync(tempFileRootFolder);
  const tempFilePath = path.join(tempFileRootFolder, `${currentTime}.${objectExtn}`);

  fs.writeFileSync(tempFilePath, fileData);

  return Promise.resolve({ tempFilePath, relativePath });
};
