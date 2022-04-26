import { initServer } from './server/index';
import { loadConfig, scanData } from './utils';

const path = require('path');

async function init() {
  const config = await loadConfig();

  const scanRes = scanData(config);

  initServer(scanRes);
}

init();
