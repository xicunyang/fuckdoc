import { deserialize } from 'v8';
import { IConfig, ICodeCommentInfo, ICollectItem } from './type';

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { parse: CommentParser } = require('comment-parser');

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

const isDirectory = (filePath: string) => {
  const stat = fs.lstatSync(filePath);
  return stat.isDirectory();
};

const isAllowSuffix = (suffix: string, userSuffix?: string[]) =>
  [...['js', 'ts', 'tsx', 'jsx', 'mjs', 'vue', 'weex'], ...[userSuffix]].includes(suffix);

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
  const { paths = [], suffix = [] } = config;

  const allFilePathsMap = new Map<string, string>();

  paths.forEach(path => {
    let files = glob.sync(path, {});

    files = files.forEach(filePath => {
      const fullPath = `${CWD}/${filePath}`;
      // 过滤掉目录
      if (!isDirectory(fullPath)) {
        // 去重 && 允许的后缀
        if (!allFilePathsMap.has(fullPath)) {
          allFilePathsMap.set(fullPath, fullPath);
        }
      }
    });
  });

  const fileFiltedPath = [...allFilePathsMap.values()];

  // 搜索到带有标识后缀的图片
  const imgFilePath = [];
  // 搜索到的合法后缀的代码文件
  const codeFilePath = [];

  fileFiltedPath.forEach(item => {
    // 判断是否是图片
    if (item.indexOf('.mooto.') > 0) {
      return imgFilePath.push(item);
    }

    // 判断是否是合法代码文件
    const strArr = item.split('.');
    const suf = strArr[strArr.length - 1];

    if (isAllowSuffix(suf, suffix)) {
      return codeFilePath.push(item);
    }
  });

  // 遍历代码文件：去文件中扫描注释
  // 组件
  const codeCommentFCMap = new Map<string, ICodeCommentInfo[]>();
  // 方法
  const codeCommentFFMap = new Map<string, ICodeCommentInfo[]>();

  codeFilePath.forEach(codePath => {
    const temp = fs.readFileSync(codePath, { encoding: 'utf-8' });
    // 使用jsdoc一样的解析器解析注释
    const parsed = CommentParser(temp) || [];

    const tempFCArr: ICodeCommentInfo[] = [];
    const tempFFArr: ICodeCommentInfo[] = [];

    // 一个文件中可能有多个注释点
    parsed.forEach(parseItem => {
      const { description = '', tags = [] } = parseItem;

      // 必须是FuckDoc标识的注释才被记录
      const isFC = description.indexOf('F:C') >= 0;
      const isFF = description.indexOf('F:F') >= 0;

      if (isFC || isFF) {
        // 解析title、desc
        let title = '';
        let desc = '';
        tags.forEach(tag => {
          if (tag.tag === 'title') {
            title = `${tag.name} ${tag.description}`;
          }

          if (tag.tag === 'desc') {
            desc = `${tag.name} ${tag.description}`;
          }
        });

        // 有注释，分开放
        if (isFC) {
          tempFCArr.push({
            type: 'FC',
            title,
            desc
          });
        }

        if (isFF) {
          tempFFArr.push({
            type: 'FF',
            title,
            desc
          });
        }
      }
    });

    // 只有当前文件中含有合法注释的文件才会被保存
    if (tempFCArr.length) {
      codeCommentFCMap.set(codePath, tempFCArr);
    }

    if (tempFFArr.length) {
      codeCommentFFMap.set(codePath, tempFFArr);
    }
  });

  // 有图片，没注释
  // 有图片，有注释
  // 没图片，有注释
  const FCArr: ICollectItem[] = [];
  const FFArr: ICollectItem[] = [];

  // 遍历图片：拼接最终参数
  imgFilePath.forEach(async imgPath => {
    const codeFullPath = imgPath.split('.mooto.')[0];

    // 判断文件是否存在
    if (fileFiltedPath.includes(codeFullPath)) {
      // 是否有注释？
      if (codeCommentFCMap.has(codeFullPath)) {
        // 有文件，有注释
        FCArr.push({
          imgPath,
          codePath: codeFullPath,
          infos: codeCommentFCMap.get(codeFullPath)
        });

        codeCommentFCMap.delete(codeFullPath);
      } else {
        // 有文件，无注释
        FCArr.push({
          imgPath,
          codePath: codeFullPath
        });
      }
    } else {
      // 有图片，无注释文件
      FCArr.push({
        imgPath
      });
    }
  })

  // 遍历注释，拼接最终参数
  // 组件
  ;[...codeCommentFCMap.keys()].forEach(codePath => {
    FCArr.push({
      codePath,
      infos: codeCommentFCMap.get(codePath)
    });
  })

  // 方法
  ;[...codeCommentFFMap.keys()].forEach(codePath => {
    FFArr.push({
      codePath,
      infos: codeCommentFFMap.get(codePath)
    });
  });

  return {
    fc: FCArr,
    ff: FFArr
  };
};
