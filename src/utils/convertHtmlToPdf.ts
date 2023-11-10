import Puppeteer, { PaperFormat } from 'puppeteer';
import { Request, Response } from 'express';
import { catchAsync } from './catchAsync';
import { sendFailureRes } from './formatResponse';
import HttpStatus from 'http-status-codes';
import path from 'path';
import { PUBLIC_PATH } from '../config/global.constants';
import mkdirp from 'mkdirp';
import Joi from 'joi';
import { commonJoiSchemaValidator } from './validators';
import fs from 'fs/promises';
import { deleteFile } from './moveFiles';

const PDF_SCHEMA = Joi.object({
  html: Joi.string().required(),
});
export const generatePdfValidatorList = [commonJoiSchemaValidator('body', PDF_SCHEMA)];

export const generatePdf = catchAsync(async (req: Request, res: Response) => {
  const { html } = req.body;
  if (!process.env.PDF_PATH) {
    return sendFailureRes(HttpStatus.BAD_REQUEST)(res, 'Invalid pdf path.')({});
  }
  const filePath = path.join(PUBLIC_PATH, process.env.PDF_PATH);
  const fileName = `${Date.now()}.pdf`;
  await mkdirp(filePath);
  const fullPath = path.join(filePath, fileName);
  await convertHtmlToPdf(encodeURIComponent(html as string), fullPath);
  const content = await fs.readFile(fullPath, { encoding: 'base64' });
  await deleteFile(fullPath);

  return res.send(content);
});

export const convertHtmlToPdf = async (finalHtml: string, pdfLocation: string, options?: Puppeteer.PDFOptions) => {
  const pdfOptions = {
    format: 'A4' as PaperFormat,
    headerTemplate: '<p></p>',
    footerTemplate: '<p></p>',
    displayHeaderFooter: false,
    margin: {
      top: '0px',
      bottom: '0px',
    },
    printBackground: true,
    path: pdfLocation,
    ...options,
  };
  const browser = await Puppeteer.launch({
    args: ['--no-sandbox', '--disable-web-security'],
    headless: true,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(300000);
  await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
    waitUntil: 'networkidle0',
  });
  await page.pdf(pdfOptions);

  await browser.close();

  return;
};
