import express, { Application } from 'express';
import './db';
import './env';
import './types/request.types';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { router } from './root.routes';
import { genericErrorHandler, methodNotAllowed } from './middlewares/errorHandler';
import logger, { logStream } from './utils/logger';

import path from 'path';
import { PUBLIC_PATH } from './config/global.constants';

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
