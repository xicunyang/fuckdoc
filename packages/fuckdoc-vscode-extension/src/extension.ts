import * as vscode from 'vscode';
import axios from 'axios';

const fs = require('fs');
const shorthash = require('shorthash');

let globalSelectedFilePath;

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

class WebviewPanel {
  public static currentPanel;
  private selectedFilePath;
  private extensionUri;
  private _disposables: vscode.Disposable[] = [];
  private _isDiff;

  constructor(selectedFilePath, extensionUri, isDiff) {
    this.selectedFilePath = selectedFilePath;

    if (process.platform === 'win32') {
      // 兼容windows中的路径
      // win中是 /c:/Users/Administxxxxxx
      // 不需要这个前面的 /
      this.selectedFilePath = selectedFilePath.substring(1, selectedFilePath.length);
    }

    this.extensionUri = extensionUri;
    this._isDiff = isDiff;

    // 如果panel不存在，就打开一个新的
    if (!WebviewPanel.currentPanel) {
      WebviewPanel.currentPanel = this._createPanel();
      this._initEvent();
    } else if (isDiff) {
      this._dispose();
      WebviewPanel.currentPanel = this._createPanel();
      this._initEvent();
    } else {
      // 否则打开原来的
      WebviewPanel.currentPanel.reveal();
    }
    this._update();
  }

  _initEvent() {
    WebviewPanel.currentPanel.onDidDispose(() => this._dispose(), null, this._disposables);

    WebviewPanel.currentPanel.webview.onDidReceiveMessage(
      message => {
        if (message.type === 'CREATE_IMG') {
          const imgArr = message.imgArr || [];
          // 路径前缀
          const prefixPath = this.selectedFilePath.substring(0, this.selectedFilePath.lastIndexOf('/'));

          // 文件名
          const fileName = this.selectedFilePath.substring(
            this.selectedFilePath.lastIndexOf('/') + 1,
            this.selectedFilePath.length
          );

          // 遍历base64数组，循环生成webp图片
          imgArr.forEach((imgBase64, idx) => {
            const hashStr = shorthash.unique(getNonce());
            const shortHashStr = hashStr.length > 4 ? hashStr.substring(0, 4) : hashStr;
            const base64 = imgBase64.replace(/^data:image\/\w+;base64,/, ''); // 去掉图片base64码前面部分data:image/png;base64
            const dataBuffer = new Buffer(base64, 'base64'); // 把base64码转成buffer对象
            const webpFileName = `${fileName}.fuckdoc.${shortHashStr}.webp`;

            fs.writeFile(`${prefixPath}/${webpFileName}`, dataBuffer, e => {
              if (e) {
                WebviewPanel.currentPanel.webview.postMessage({
                  type: 'CREATE_IMG_ERROR',
                  imgName: webpFileName,
                  index: idx,
                });
              } else {
                WebviewPanel.currentPanel.webview.postMessage({
                  type: 'CREATE_IMG_DONE',
                  imgName: webpFileName,
                  index: idx,
                });
              }
            });
          });
        }
      },
      undefined,
      this._disposables
    );
  }

  _dispose() {
    WebviewPanel.currentPanel.dispose();
    WebviewPanel.currentPanel = undefined;

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  _createPanel() {
    // 创建一个新的panel
    return vscode.window.createWebviewPanel('addPic', '添加图片', vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    });
  }

  _update() {
    WebviewPanel.currentPanel.webview.html = this._createHtml();
  }

  _createHtml() {
    // js文件
    const scriptPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js');
    const scriptUri = WebviewPanel.currentPanel.webview.asWebviewUri(scriptPath);

    // html模板
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
          <link rel="icon" href="favicon.ico" type="image/x-icon" />
        </head>
        <body>
          <div id="root"></div>
          <script>
            window._fuckdoc_current_component_path = '${this.selectedFilePath}';

            if (!window._vscode) {
              window._vscode = acquireVsCodeApi();
            }

            ${this._isDiff ? 'window._vscode.setState([])' : ''}
          </script>
          <script src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}

function injectCode(title: string) {
  const editor = vscode.window.activeTextEditor;
  const cursorPosition = editor.selection.active; // a vscode.Position

  console.log('cursorPosition:::', cursorPosition);
  vscode.window.activeTextEditor.edit(builder => {
    builder.replace(
      cursorPosition,
      `/**
* ${title}
* 
* @title 这是标题
* @description 这是一段测试描述
* @param {string} arg1 这是参数1
* @param {number} arg2 这是参数2
*/`
    );
  });
}

export const reportLog = ({ where = 'unknown', c_num = 0, f_num = 0 }) => {
  try {
    const { platform } = process;
    axios.get(
      `http://fuckdoc-log.cn-beijing.log.aliyuncs.com/logstores/npm/track?APIVersion=0.6.0&platform=${platform}&where=${where}&c_num=${c_num}&f_num=${f_num}`
    );
  } catch (e) {}
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fuckdoc.addPic', async (uri: any) => {
      reportLog({
        where: 'add-pic',
      });
      const selectedFilePath = uri.path as string;

      try {
        const isDiff = globalSelectedFilePath && globalSelectedFilePath !== selectedFilePath;
        new WebviewPanel(selectedFilePath, context.extensionUri, isDiff);

        globalSelectedFilePath = selectedFilePath;
      } catch (e) {
        console.log('e:::', e);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('fuckdoc.addAnnotationFC', async (uri: any) => {
      reportLog({
        where: 'add-annotation-fc',
      });
      injectCode('F:C');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('fuckdoc.addAnnotationFF', async (uri: any) => {
      reportLog({
        where: 'add-annotation-ff',
      });
      injectCode('F:F');
    })
  );
}

export function deactivate() {}
