import {
  PDFDocument,
  grayscale,
  rgb,
  StandardFonts,
  PDFPageDrawCircleOptions,
  PDFPageDrawSVGOptions,
  PDFPageDrawTextOptions,
  RotationTypes,
} from 'pdf-lib';
import fs from 'fs';
import Boom from '@hapi/boom';
import { TPdfFirstPage } from '../types';
import { TicketStatus } from './enums';

export const getPdfFirstPageDetails = async (pdfLocation: string) => {
  if (!fs.existsSync(pdfLocation)) {
    throw Boom.notFound('Invalid PDF.');
  }
  const pdfData = fs.readFileSync(pdfLocation);
  const pdfDocument = await PDFDocument.load(pdfData);
  const firstPage = pdfDocument.getPage(0);
  const rotation = firstPage.getRotation().angle;
  const { width, height } = firstPage.getSize();
  const helveticaFont = await pdfDocument.embedFont(StandardFonts.Helvetica);
  firstPage.setFont(helveticaFont);

  return { width, height, pdfDocument, rotation, pageObject: firstPage };
};

/**
 * Polulates the assets table with uploaded file details
 * @param pdfPageDetail - req.files ie, filedetails attached to request after file are uploaded to s3
 * @param svgText - svgText
 * @param coordinates - svg coordinates
 * @returns
 */
export const drawSvgOnPdf = (
  pdfPageDetail: TPdfFirstPage,
  svgText: string,
  coordinates: number[],
  status: TicketStatus
) => {
  const { width, height, pageObject: firstPage, rotation } = pdfPageDetail;

  const generalizedScaleFromDimensions = Math.ceil(width / 595);

  const svgPath = `M 0 0 L 4 0 C 5 0 5 0 5 1 L 5 3 C 5 4 5 4 4 4 L 3 4 C 2 4 2.3333 4.6667 2 5 C 1.6667 4.6667 2 4 1 4 L 0 4 C -1 4 -1 4 -1 3 L -1 1 C -1 0 -1 0 0 0`;
  let svgColor = rgb(0.89, 0.26, 0.05);
  if (status === TicketStatus['in progress']) {
    svgColor = rgb(0.2, 0.32, 0.75);
  } else if (status === TicketStatus.feedback) {
    svgColor = rgb(1, 0.71, 0);
  } else if (status === TicketStatus.completed) {
    svgColor = rgb(0.46, 0.8, 0);
  }

  let circleShape: PDFPageDrawCircleOptions = {
    x: coordinates[0],
    y: coordinates[1],
    size: 1 * generalizedScaleFromDimensions,
  };
  let svgItem: PDFPageDrawSVGOptions = {
    x: coordinates[0] - 4 * generalizedScaleFromDimensions,
    y: coordinates[1] + 11 * generalizedScaleFromDimensions,
    scale: 2 * generalizedScaleFromDimensions,
  };
  let textItem: PDFPageDrawTextOptions = {
    x: coordinates[0] - 1.2 * generalizedScaleFromDimensions * svgText.length,
    y: coordinates[1] + 5.5 * generalizedScaleFromDimensions,
    size: 4.5 * generalizedScaleFromDimensions,
    lineHeight: 4.5 * generalizedScaleFromDimensions,
  };

  if (rotation === 90 && height > width) {
    circleShape = {
      x: coordinates[0],
      y: coordinates[1],
      size: 1 * generalizedScaleFromDimensions,
    };
    svgItem = {
      x: coordinates[0] - 11 * generalizedScaleFromDimensions,
      y: coordinates[1] - 4 * generalizedScaleFromDimensions,
      rotate: { angle: rotation, type: RotationTypes.Degrees },
      scale: 2 * generalizedScaleFromDimensions,
    };
    textItem = {
      x: coordinates[0] - 5 * generalizedScaleFromDimensions,
      y: coordinates[1] - 1.2 * generalizedScaleFromDimensions * svgText.length,
      rotate: { angle: rotation, type: RotationTypes.Degrees },
      size: 4.5 * generalizedScaleFromDimensions,
      lineHeight: 4.5 * generalizedScaleFromDimensions,
    };
  }

  firstPage.drawCircle({
    ...circleShape,
    borderWidth: 2,
    borderColor: grayscale(0.5),
    color: rgb(0, 0, 0),
    opacity: 1,
    borderOpacity: 0.75,
  });

  firstPage.drawSvgPath(svgPath, {
    ...svgItem,
    color: svgColor,
    opacity: 1,
  });

  firstPage.drawText(svgText, {
    ...textItem,
    color: rgb(1, 1, 1),
    opacity: 1,
  });
};
