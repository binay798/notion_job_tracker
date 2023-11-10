import fs from 'fs';
import Boom from '@hapi/boom';
import * as childProcess from 'child_process';
// import logger from './logger';
import mime from 'mime-types';
import path from 'path';
import mkdirp from 'mkdirp';
import PersistentFile from 'formidable/PersistentFile';
import { IAssets } from '../types/assets.types';
import * as assetServices from '../assets/assets.services';
import { Transaction } from 'knex';
import { FLOOR_PLAN, PUBLIC_PATH } from '../config/global.constants';
import mv from 'mv';
import { FileType } from './enums';
import fsPromise from 'fs/promises';
import { FormidableFile } from '../types/files.types';
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

export const moveAssets = async (
  uploadedFiles: FormidableFile[] = [],
  fileType: FileType,
  fileSysDir: string,
  userId: number,
  transx?: Transaction
) => {
  try {
    const assetIds = [];
    const randomInt = getRandomInt(10000);
    for await (const el of uploadedFiles) {
      // @ts-ignore
      const extension = mime.extension(el.mimetype);
      if (extension) {
        const fileName = `${Date.now() + randomInt}`;
        const data: Omit<IAssets, 'id' | 'created_at' | 'updated_at'> = {
          name: fileName,
          file_type: fileType,
          is_active: true,
          label: el.originalname as string,
        };
        const asset = await assetServices.createAsset(data, userId, transx);

        const assetFolder = path.join(PUBLIC_PATH, fileSysDir, `${asset.id}`);
        await mkdirp(assetFolder);
        // @ts-ignore
        await moveFiles(el.filepath, path.join(assetFolder, `${fileName}.${extension}`));
        assetIds.push(asset.id);
      }
    }

    return assetIds;
  } catch (err) {
    throw Boom.badRequest('Something went wrong while uploading assets.');
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

/**
 * Converts floorplan pdf to image. Returns db path of image if provided file is pdf
 * Otherwise return null.
 * sudo apt install poppler-utils
 *
 */
export const pdfToImage = (pdfFile: FormidableFile, imgPath: string) => {
  const extension = mime.extension(pdfFile.mimetype as string);

  if (extension !== 'pdf') {
    throw Boom.forbidden('Only pdf is supported for project plan.');
  }

  return new Promise((resolve, reject) => {
    mkdirp.sync(imgPath);

    const command = `pdftoppm -jpeg -r 300 -singlefile ${pdfFile.filepath} ${path.join(
      imgPath,
      FLOOR_PLAN.image.split('.')[0]
    )}`;
    const newProcess = childProcess.spawn(command, {
      stdio: 'pipe',
      shell: true,
    });
    let errData = '';
    newProcess.stderr.on('data', (err) => {
      errData = errData + err;
    });

    newProcess.on('close', () => {
      if (errData) {
        reject(Boom.internal(errData));
      }

      return resolve(path.join(imgPath, FLOOR_PLAN.image));
    });
  });
};

/**
 * Converts floor plan image to tiles
 * sudo apt install python-gdal OR sudo apt install python3-gdal
 *
 */
export const imageToTiles = async (imagePath: string, parentPath: string, id: number) => {
  const floorPlanFolder = path.join(parentPath, FLOOR_PLAN.tiles);
  await deleteFolder(floorPlanFolder).catch(() => null);
  mkdirp.sync(floorPlanFolder);

  return new Promise((resolve, reject) => {
    const command = `python3 gdal2tiles.py -l -p raster -w none ${imagePath} ${path.join(
      parentPath,
      FLOOR_PLAN.tiles
    )}`;
    const newProcess = childProcess.spawn(command, {
      stdio: 'pipe',
      shell: true,
      cwd: `${process.env.PYTHONDIR}`,
    });
    let errData = '';
    newProcess.stderr.on('data', (err) => {
      errData = errData + err;
    });

    newProcess.on('close', () => {
      if (errData) {
        reject(Boom.internal(errData));
      }

      return resolve(`${id}/${FLOOR_PLAN.tiles}`);
    });
  });
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
