export interface BaseAttribute {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export type CmnOmit<T, K extends string | number = ''> = Omit<T, 'id' | 'created_at' | 'updated_at' | K>;

export type TPdfFirstPage = {
  width: number;
  height: number;
  rotation: number;
  pdfDocument: PDFDocument;
  pageObject: PDFPage;
};
