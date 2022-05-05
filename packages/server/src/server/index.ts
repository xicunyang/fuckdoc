import { IConfig, IData } from '../type';
import { loadConfig, scanData, CWD, debounce } from './../utils';
import { WebSocketServer } from 'ws';

const path = require('path');
const glob = require('glob');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaRouter = require('koa-router'); // 引入koa-router
const fs = require('fs');
const mime = require('mime-types');
const childProcess = require('child_process');
const cors = require('koa2-cors');
const launch = require('launch-editor');
const openInEditor = require('open-in-editor');
const portfinder = require('portfinder');
const colors = require('ansi-colors');
const chokidar = require('chokidar');

let globalData: IData, globalWs, globalWsPort;

const wait = time =>
  new Promise(r => {
    setTimeout(() => {
      r(true);
    }, time);
  });

const doOpenEditor = (path: string) =>
  new Promise((r, j) => {
    const editor = openInEditor.configure(
      {
        editor: 'code'
      },
      function (err) {
        j(err);
      }
    );

    editor.open(path).then(
      function () {
        r(true);
      },
      function (err) {
        j(err);
      }
    );
  });

export const initServer = (config: IConfig) => {
  const app = new Koa();
  const router = new koaRouter(); // 创建路由，支持传递参数

  // 跨域
  app.use(cors());
  // 路由
  app.use(router.routes());

  // 静态目录
  app.use(
    koaStatic(
      path.join(__dirname, '../', 'client'), // 默认static文件夹下，也可以改成其他或根目录
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

  // const doExecCode = sourcePath => {
  //   const spawn = childProcess.spawnSync('code', [sourcePath]);
  //   const errorText = spawn.error?.toString().trim();
  //   return errorText;
  // };

  // 根据资源路径，在vscode中打开资源
  router.get('/open-source', async ctx => {
    const { path } = ctx.request.query;

    try {
      const res = await doOpenEditor(path);
      await wait(1500);

      ctx.body = JSON.stringify({
        success: true
      });
    } catch (e) {
      ctx.body = JSON.stringify({
        success: false,
        msg: e
      });
    }
  });

  // 获取所有数据
  router.get('/data', async ctx => {
    ctx.type = 'json';
    ctx.body = JSON.stringify({
      data: {
        ...globalData,
        wsPort: globalWsPort
      }
    });
  });

  portfinder.getPort(
    {
      port: 9527,
      stopPort: 9999
    },
    (err, port) => {
      const { port: configPort } = config;
      const finalPort = configPort || port;

      app.listen(finalPort, () => {
        console.log('\n');
        console.log(colors.green('🎉🎉🎉 fuckdoc已经启动 🎉🎉🎉'));
        console.log('\n');
        console.log(colors.green(`点击 http://127.0.0.1:${finalPort} 试试吧！`));
        console.log('\n');
      });
    }
  );
};

async function refreshData() {
  globalData = await scanData();

  globalWs &&
    globalWs.send(
      JSON.stringify({
        type: 'Refresh'
      })
    );
}

function initWatch(config: IConfig) {
  const { paths } = config;

  const watcher = chokidar.watch(paths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  const debounceRefreshData = debounce(refreshData, 1000);

  watcher.on('all', path => {
    debounceRefreshData();
  });
}

function initWs(callback) {
  portfinder.getPort(
    {
      port: 10357,
      stopPort: 10400
    },
    (err, port) => {
      globalWsPort = port;
      callback();

      const wss = new WebSocketServer({ port });

      wss.on('connection', function connection(ws) {
        globalWs = ws;
      });
    }
  );
}

export async function startServer() {
  const config = await loadConfig();
  globalData = await scanData();

  // 初始化websocket
  initWs(() => {
    // 初始化server
    initServer(config);

    // 初始化监听
    initWatch(config);
  });
}
