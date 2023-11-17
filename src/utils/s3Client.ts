// import {
//   S3Client as Client,
//   DeleteObjectsCommand,
//   ListObjectsV2Command,
//   GetBucketAclCommand,
//   GetObjectCommand,
//   CopyObjectCommand,
// } from '@aws-sdk/client-s3';
// import path from 'path';
// import { FILETYPE_MIMETYPE_MAP } from '../config/global.constants';
// import { FileType } from '../utils/enums';
// import { Upload } from '@aws-sdk/lib-storage';
// import { createReadStream } from 'fs';
// import * as childProcess from 'child_process';
// import { Transaction } from 'knex';
// import { isArray } from 'lodash';
// import { bulkInsertAssets } from '../assets/assets.services';
// import util from 'util';
// import { deleteFile, deleteFolder, writeOnTempFile } from './moveFiles';
// import logger from './logger';

// interface ClientType {
//   region: string;
//   credentials: {
//     accessKeyId: string;
//     secretAccessKey: string;
//   };
//   bktName?: string;
// }

// export class S3Client extends Client {
//   bucket = process.env.S3_BUCKET_NAME as string;

//   constructor(props: ClientType) {
//     super({ region: props.region, credentials: props.credentials });
//     if (props.bktName) {
//       this.bucket = props.bktName;
//     }
//   }

//   // make key of file according to folder structure, helps in grouping files when viewed from aws console
//   /**
//    * @param directory - full parent directory of file/object like 'user/profile'
//    * @param id - this will be used to create folder for storing files of entity with given id
//    * @param extension - file extension
//    * @returns fullkeyofobject
//    */
//   makeObjectKey = (directory: string, id: string, extension: string) => {
//     return `${directory}/${id}/${Date.now().toString()}${extension}`;
//   };

//   allowedMimeTypes = Object.values(FILETYPE_MIMETYPE_MAP).flat();

//   /**
//    * Upload files to S3
//    */
//   uploadFilesToS3 = (keyName: string, file: { filepath: string; originalname: string; mimetype: string }) => {
//     const stream = createReadStream(file.filepath);

//     return new Upload({
//       client: this,
//       params: {
//         Bucket: this.bucket,
//         Body: stream,
//         Key: keyName,
//       },
//     })
//       .done()
//       .then(async (data) => {
//         await deleteFile(file.filepath).catch((err) =>
//           logger.error(`Error: Error occured while uploading files to S3 ${err}`)
//         );

//         return {
//           fileDetails: file,
//           data,
//         };
//       })
//       .catch((err) => err);
//   };

//   /**
//    * Upload project plan to s3 through aws cli
//    * Need to configure aws cli before using this util
//    * > pip install --upgrade --user awscli
//    * > aws configure
//    */
//   cliUploadFolderToS3 = (localFolderPath: string, s3ObjectPath: string, bktName = this.bucket) => {
//     return new Promise((resolve, reject) => {
//       const s3FullPath = path.join(bktName, s3ObjectPath);
//       const command = `aws s3 sync --only-show-errors ${localFolderPath} s3://${s3FullPath}`;
//       const promiseExec = util.promisify(childProcess.exec);

//       return promiseExec(command)
//         .then(async () => {
//           await deleteFolder(localFolderPath).catch((err) =>
//             logger.error(`Error: Error occured while uploading project plan folder to S3 ${err}`)
//           );

//           return resolve(null);
//         })
//         .catch((err) => reject(err));
//     });
//   };

//   deleteS3Object = async (key: string) => {
//     try {
//       const listCommand = new ListObjectsV2Command({ Bucket: this.bucket, Prefix: key });
//       const list = await this.send(listCommand);
//       if (list.KeyCount) {
//         const command = new DeleteObjectsCommand({
//           Bucket: this.bucket,
//           Delete: {
//             Objects: list.Contents?.map((item) => ({ Key: item.Key })),
//             Quiet: false,
//           },
//         });
//         await this.send(command).catch(() => null);
//       }
//     } catch (err) {
//       throw new Error(err as string);
//     }
//   };

//   bulkDeleteS3Object = async (keys: string[]) => {
//     try {
//       const command = new DeleteObjectsCommand({
//         Bucket: this.bucket,
//         Delete: {
//           Objects: keys.map((el) => ({ Key: el })),
//           Quiet: false,
//         },
//       });
//       await this.send(command).catch(() => null);
//     } catch (err) {
//       throw new Error(err as string);
//     }
//   };

//   // Get contentType according to mimeType
//   getContentType = (mimeType: string) => {
//     let contentType = FileType.document;
//     Object.keys(FILETYPE_MIMETYPE_MAP).map((e) => {
//       contentType = FILETYPE_MIMETYPE_MAP[e as FileType].includes(mimeType) ? (e as FileType) : contentType;
//     });

//     return contentType;
//   };

//   copyObject = (copySource: string, key: string) => {
//     const cmd = new CopyObjectCommand({
//       Bucket: this.bucket,
//       CopySource: copySource,
//       Key: key,
//     });

//     return this.send(cmd);
//   };

//   /**
//    * Polulates the assets table with uploaded file details
//    * @param fileMetaData - req.files ie, filedetails attached to request after file are uploaded to s3
//    * @param userId -  user who created the file
//    * @param transx - Transaction
//    * @returns
//    */
//   makeS3Assets = (
//     fileMetaData:
//       | Express.MulterS3.File[]
//       | { [fieldname: string]: Express.MulterS3.File[] }
//       | undefined
//       | { key: string; mimetype: string; originalname: string }[],
//     userId: number,
//     transx: Transaction
//   ) => {
//     const assets = [];
//     if (isArray(fileMetaData)) {
//       for (const file of fileMetaData) {
//         const assetData = {
//           name: file.key,
//           file_type: this.getContentType(file.mimetype),
//           is_active: true,
//           label: file.originalname,
//         };
//         assets.push(assetData);
//       }
//     }

//     return bulkInsertAssets(assets, userId, transx).then((assets) => {
//       return assets.map((asset) => asset.id);
//     });
//   };

//   /**
//    * Download S3 Object to temp folder on server
//    * @param objectKey - full key name uploaded on S3
//    * @param objectExtn -  s3 object extension
//    * @returns
//    */
//   downloadS3Object = async (objectKey: string, objectExtn: string) => {
//     const command = new GetObjectCommand({
//       Bucket: this.bucket,
//       Key: objectKey,
//     });

//     try {
//       const response = await this.send(command);
//       if (response?.Body) {
//         const s3ObjContent = await response.Body.transformToByteArray();
//         const { tempFilePath } = await writeOnTempFile(objectExtn, s3ObjContent);

//         return Promise.resolve(tempFilePath);
//       }
//     } catch (err) {
//       throw new Error(err as string);
//     }
//   };
// }

// export const s3 = new S3Client({
//   region: process.env.S3_REGION as string,
//   credentials: {
//     accessKeyId: process.env.S3_USER_ACCESS_KEY_ID as string,
//     secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY as string,
//   },
// });

// (async () => {
//   try {
//     const cmd = new GetBucketAclCommand({ Bucket: s3.bucket });
//     await s3.send(cmd);
//   } catch (err) {
//     throw new Error(err as string);
//   }
// })();
