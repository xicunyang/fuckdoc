import { ICollectItem } from '../type';

const path = require('path');
const glob = require('glob');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaRouter = require('koa-router'); // 引入koa-router
const fs = require('fs');
const mime = require('mime-types');
const childProcess = require('child_process');
const cors = require('koa2-cors');


export const initServer = (collectData: ICollectItem[]) => {
  const app = new Koa();
  const router = new koaRouter(); // 创建路由，支持传递参数

  // 跨域
  app.use(cors());
  // 路由
  app.use(router.routes());

  // 静态目录
  // TODO: 修改成相对路径
  app.use(
    koaStatic(
      path.join(`${process.cwd()}/mooto`), // 默认static文件夹下，也可以改成其他或根目录
      {
        index: 'index.html', // 默认为static下的index.html,也可以更改其他名字或者false
        hidden: false,
        defer: true
      }
    )
  );

  // 根据图片地址获取图片
  router.get('/img', async ctx => {
    const { path } = ctx.request.query;

    const file = fs.readFileSync(path);
    const mimeType = mime.lookup(path);

    ctx.set('content-type', mimeType); // 设置返回类型
    ctx.body = file; // 返回图片
  });

  // 根据资源路径，在vscode中打开资源
  router.get('/open-source', ctx => {
    const { path } = ctx.request.query;
    childProcess.exec(`code ${path}`);
  });

  // 获取所有数据
  router.get('/data', async ctx => {
    console.log('this is in ');

    ctx.type = 'json';
    ctx.body = JSON.stringify({
      data: collectData
    });
  });

  app.listen(9527, () => {
    console.log('应用已经启动，http://localhost:9527');
  });
};
