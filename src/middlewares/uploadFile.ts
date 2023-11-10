import * as childProcess from 'child_process';
import { Request, Response, NextFunction } from 'express';
import formidable from 'formidable';
import mkdirp from 'mkdirp';
import { PUBLIC_PATH } from '../utils/constants';

export const uploadFile = (uploadType = 'image', multiples = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = new formidable.IncomingForm({
        uploadDir: `${PUBLIC_PATH}/temp/${Date.now()}`,
        multiples,
        filter: ({ mimetype }) => {
          let allowedMimeTypes = ['image/jpeg', 'image/png'];
          if (uploadType === 'pdf') {
            allowedMimeTypes = ['application/pdf'];
          }

          return (mimetype && allowedMimeTypes.includes(mimetype)) || false;
        },
      });
      // @ts-ignore
      mkdirp.sync(form.uploadDir); // CREATE FOLDER IF IT DOESNOT EXIST

      form.parse(req, (err, fields, files) => {
        if (err) {
          // @ts-ignore
          childProcess.exec(`rmdir /s /q ${form.uploadDir}`);
        }
        const filesKey = Object.keys(files);
        for (let i = 0; i < filesKey.length; i++) {
          // @ts-ignore
          req[`${filesKey[i]}s`] = changeToArray(files[filesKey[i]]);
        }
        req.body = fields;
        // @ts-ignore
        req.uploadDir = form.uploadDir;

        next();
      });
    } catch (err) {
      return next(err);
    }
  };
};

const changeToArray = (data: formidable.File | formidable.File[]) => {
  if (!Array.isArray(data)) {
    if (!data) {
      return [];
    } else {
      return [data];
    }
  }

  return data;
};
