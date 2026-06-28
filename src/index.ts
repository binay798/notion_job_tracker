import express, { Application, Request, Response } from 'express';
// import './db';
import './env';
import './types/request.types';
import './config/genai.config';
import './utils/getDefaultResume';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { router } from './root.routes';
import { genericErrorHandler, methodNotAllowed } from './middlewares/errorHandler';
import logger, { logStream } from './utils/logger';

import cron from 'node-cron';

import path from 'path';
import { PUBLIC_PATH } from './config/global.constants';
import { getAllToBeProcessedJob } from './tracker/tracker.services';

// (async () => {
//   const applicationsPageId = '3830d70e-79c6-80d1-a6ca-eeca50c148ee';
//   const res = await notion.blocks.children.list({ block_id: applicationsPageId });
//   // console.log(res);
//   const results = res.results;
//   for await (const i of results) {
//     const res = await notion.databases.retrieve({ database_id: i.id });
//     // @ts-ignore
//     const dataSources = res.data_sources[0];
//     const queriedDatasource = await notion.dataSources.query({ data_source_id: dataSources.id });
//     const rowPages = queriedDatasource.results;
//     rowPages.forEach((el) => {
//       // @ts-ignore
//       deepConsole(Object.keys(el.properties));
//     });
//   }
// })();
cron.schedule('0 * * * *', () => {
  // Call your function here
  getAllToBeProcessedJob();
});
export const app: Application = express();
// MIDDLEWARES
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(favicon(path.join(PUBLIC_PATH, 'favicon.ico')));
app.use('/static', express.static(PUBLIC_PATH));

app.use(morgan('dev', { stream: logStream }));
app.use('/api', router);
app.get('/force-start', async (req: Request, res: Response) => {
  await getAllToBeProcessedJob();

  return res.json({ status: 'success' });
});

// PAGE ID = 3830d70e-79c6-807b-836e-dbd90102fa37
// type = page.properties_updated

app.use(genericErrorHandler);
app.use(methodNotAllowed);

let PORT = parseInt(process.env.PORT || '8000');
const HOST = process.env.APP_HOST || 'localhost';
if (process.env.NODE_ENV === 'test') {
  PORT = parseInt(process.env.TEST_APP_PORT || '8000');
}

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running at ${HOST}:${PORT}`);
});

/**
 * Resolve unhandled rejection
 */
process.on('unhandledRejection', (err) => {
  logger.error('Unhaldled rejection', err);
  server.close(() => {
    process.exit(1);
  });
});
/**
 * Resolve uncaught exception
 */
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  server.close(() => {
    process.exit(1);
  });
});
