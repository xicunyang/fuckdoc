#!/usr/bin/env node

import { startServer } from './server/index';
import startSharp from './sharp/index';
import { reportLog } from './utils';

const isSharp = process.argv.filter(item => item.indexOf('sharp') >= 0).length > 0;

if (isSharp) {
  reportLog({
    where: 'sharp'
  });
  startSharp();
} else {
  reportLog({
    where: 'start'
  });
  startServer();
}
