import fs from 'fs';
import path from 'path';
import { PUBLIC_PATH } from '../config/global.constants';

export const DEFAULT_RESUME = fs.readFileSync(path.join(PUBLIC_PATH, 'defaultResume.txt'), 'utf-8');
