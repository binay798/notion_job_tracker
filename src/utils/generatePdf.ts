// import { Request, Response } from 'express';
// import { catchAsync } from './catchAsync';
// import { sendFailureRes, sendSuccessRes } from './formatResponse';
// import HttpStatus from 'http-status-codes';
// import { convertHtmlToPdf } from './convertHtmlToPdf';
// import path from 'path';
// import { PUBLIC_PATH } from '../config/global.constants';
// import mkdirp from 'mkdirp';

// export const purContDownloadPurchaseOrderPdf = catchAsync(async (req: Request, res: Response) => {
//   const { html } = req.body;
//   if (!process.env.PURCHASE_ORDER_PDF_PATH) {
//     return sendFailureRes(HttpStatus.BAD_REQUEST)(res, 'Invalid pdf path.')({});
//   }
//   const filePath = path.join(PUBLIC_PATH, process.env.PURCHASE_ORDER_PDF_PATH);
//   const fileName = `${Date.now()}.pdf`;
//   await mkdirp(filePath);
//   const fullPath = path.join(filePath, fileName);
//   await convertHtmlToPdf(encodeURIComponent(html), fullPath);
//   const downloadLink = path.join('/assets/purchase-order', fileName);

//   return sendSuccessRes(HttpStatus.OK)(res, 'Successfully to download link')({
//     downloadLink,
//   });
// });
