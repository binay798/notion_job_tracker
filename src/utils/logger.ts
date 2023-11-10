import fs from 'fs';
import winston, { format } from 'winston';

import 'winston-daily-rotate-file';
import util from 'util';

// Use LOG_DIR from env
const LOG_DIR = process.env.LOGGING_DIR || 'logs';
const LOG_LEVEL = process.env.LOGGING_LEVEL || 'info';

// Create log directory if it does not exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

/**
 * Create a new winston logger.
 */
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: 'info',
    }),
    new winston.transports.DailyRotateFile({
      format: format.combine(format.timestamp(), format.json()),
      maxFiles: '14d',
      level: LOG_LEVEL,
      dirname: LOG_DIR,
      datePattern: 'YYYY-MM-DD',
      filename: '%DATE%-debug.log',
    }),
  ],
});

export const logStream = {
  /**
   * A writable stream for winston logger.
   *
   * @param {any} message
   */
  write(message: string) {
    logger.info(message.toString());
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
export const deepConsole = (data: any) => console.log(util.inspect(data, true, 10, true));

export default logger;
