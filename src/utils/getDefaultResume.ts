import fs from 'fs';
import path from 'path';

export const DEFAULT_RESUME = fs.readFileSync(
  path.join(process.env.ROOT_PATH, 'src', 'config', 'defaultResume.txt'),
  'utf-8'
);
