import { startServer } from './server/index';
import startSharp from './sharp/index';

const isSharp = process.argv.filter(item => item.indexOf('sharp') >= 0).length > 0;

if (isSharp) {
  startSharp();
} else {
  startServer();
}
