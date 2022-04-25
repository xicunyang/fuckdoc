import { IConfig } from './type';

const path = require('path');
const fs = require('fs');
const glob = require('glob');

export const CWD = process.cwd();

const DefaultConfig: IConfig = {
  paths: ['src/**/*']
};

const fileExists = (filePath: string) =>
  new Promise(r => {
    fs.exists(filePath, exists => {
      if (exists) {
        r(true);
      } else {
        r(false);
      }
    });
  });

const commonRequire = (path: string) => {
  const res = require(path);
  return res;
};

export const loadConfig = async () => {
  const configFilePath = path.join(CWD, '/mooto.config.js');

  // 简单处理，用户的配置直接覆盖默认配置
  let config = DefaultConfig;
  const isConfigFileExists = await fileExists(configFilePath);
  if (isConfigFileExists) {
    config = commonRequire(configFilePath);
  }

  return config;
};

export const scanData = (config: IConfig) => {
  const allFile = [];
  const { paths = [] } = config;

  paths.forEach(path => {
    const files = glob.sync(path, {});

    const filtedImages = files.filter(item => item.indexOf('.mooto.') >= 0);
    const fullPathImages = filtedImages.map(item => `${CWD}/${item}`);

    allFile.push(...fullPathImages);
  });

  return Array.from(new Set(allFile));
};
