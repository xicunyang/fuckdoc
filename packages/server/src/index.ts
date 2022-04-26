import { initServer } from './server/index';
import { loadConfig, scanData } from './utils';

const path = require('path');

async function init() {
  const config = await loadConfig();

  console.log('配置文件加载成功:::', config);
  const scanRes = scanData(config);

  initServer(scanRes);
}

init();
