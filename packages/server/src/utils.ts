import { IConfig, ICodeCommentInfo, ResourceType, ICollectItemRes } from './type';

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
  const configFilePath = path.join(CWD, '/fuckdoc.config.js');

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

  // 1、找出所有非文件夹的文件，并去重
  const allFilePathsMap = new Map<string, string>();

  paths.forEach(path => {
    let files = glob.sync(path, {});

    files = files.forEach(filePath => {
      const fullPath = `${CWD}/${filePath}`;
      // 过滤掉目录
      if (!isDirectory(fullPath)) {
        // 去重
        if (!allFilePathsMap.has(fullPath)) {
          allFilePathsMap.set(fullPath, fullPath);
        }
      }
    });
  });

  const fileFiltedPath = [...allFilePathsMap.values()];

  // 图片路径：文件名带有.fuckdoc.的图片
  const imgFilePath = [];
  // 代码文件：所有合法文件后缀的文件
  const codeFilePath = [];

  // 分类：图片文件 、 代码文件
  fileFiltedPath.forEach(item => {
    // 判断是否是图片
    if (item.indexOf('.fuckdoc.') > 0) {
      return imgFilePath.push(item);
    }

    // 判断是否是合法代码文件
    const strArr = item.split('.');
    const suf = strArr[strArr.length - 1];

    if (isAllowSuffix(suf, suffix)) {
      return codeFilePath.push(item);
    }
  });

  // 组件
  const codeCommentFCMap = new Map<string, ICodeCommentInfo[]>();
  // 方法
  const codeCommentFFMap = new Map<string, ICodeCommentInfo[]>();

  // 遍历代码文件：去文件中扫描注释
  codeFilePath.forEach(codePath => {
    const temp = fs.readFileSync(codePath, { encoding: 'utf-8' });
    // 使用jsdoc一样的解析器解析注释
    const parsed = CommentParser(temp) || [];    

    const tempFCArr: ICodeCommentInfo[] = [];
    const tempFFArr: ICodeCommentInfo[] = [];

    // 一个文件中可能有多个注释点
    parsed.forEach(parseItem => {
      const { description = '', tags = [] } = parseItem;

      // 必须是FuckDoc特殊标识的注释才被记录
      // F:C  or  F:F
      const isFC = description.indexOf('F:C') >= 0;
      const isFF = description.indexOf('F:F') >= 0;

      const params = [];

      if (isFC || isFF) {
        // 解析title、desc
        let title = '';
        let desc = '';
        let startLine = 0;
        tags.forEach((tag, index) => {
          if (tag.tag === 'title') {
            title = `${tag.name} ${tag.description}`;
          }

          if (tag.tag === 'desc') {
            desc = `${tag.name} ${tag.description}`;
          }

          if(tag.source[0] && tag.source[0].number != null) {
            startLine = tag.source[0].number;
          }

          if(tag.tag === 'param') {
            params.push({
              name: tag.name,
              type: tag.type,
              description: tag.description,
            });
          }
        });

        // 有注释，分开放
        if (isFC) {
          tempFCArr.push({
            type: ResourceType.FC,
            title,
            desc,
            startLine,
            params
          });
        }

        if (isFF) {
          tempFFArr.push({
            type: ResourceType.FF,
            title,
            desc,
            startLine,
            params
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
  const FCArr: ICollectItemRes[] = [];
  const FFArr: ICollectItemRes[] = [];

  // 遍历图片：拼接最终参数
  imgFilePath.forEach(async imgPath => {
    // 根据图片反推文件地址
    const codeFullPath = imgPath.split('.fuckdoc.')[0];

    // 判断文件是否存在
    if (fileFiltedPath.includes(codeFullPath)) {
      // 是否有注释？
      if (codeCommentFCMap.has(codeFullPath)) {
        // 有代码文件，且代码文件中有注释
        // will: 跳转到代码文件中(对应的某一行)

        // 已infos进行遍历，拆分为多条数据
        const infos = codeCommentFCMap.get(codeFullPath);

        infos.forEach(info => {
          FCArr.push({
            imgPath,
            codePath: codeFullPath,
            info
          });
        });

        codeCommentFCMap.delete(codeFullPath);
      } else {
        // 有代码文件，但是没有相关注释
        // will: 直接跳到代码文件中，第一行
        FCArr.push({
          imgPath,
          codePath: codeFullPath
        });
      }
    } else {
      // 有图片，无代码文件
      // will: 给warning，该图片没意义
      FCArr.push({
        imgPath
      });
    }
  })

  // 遍历注释，拼接最终参数
  // 组件
  ;[...codeCommentFCMap.keys()].forEach(codePath => {
    codeCommentFCMap.get(codePath).forEach(info => {
      FCArr.push({
        codePath,
        info
      });
    });
  })

  // 方法
  ;[...codeCommentFFMap.keys()].forEach(codePath => {
    codeCommentFFMap.get(codePath).forEach(info => {
      FFArr.push({
        codePath,
        info
      });
    });
  });

  return {
    [ResourceType.FC]: FCArr,
    [ResourceType.FF]: FFArr
  };
};
