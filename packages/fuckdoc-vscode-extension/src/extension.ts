import * as vscode from 'vscode'
const fs = require('fs')
const sharp = require('sharp')

export function activate(context: vscode.ExtensionContext) {
  console.log('插件启动成功')

  context.subscriptions.push(
    vscode.commands.registerCommand('fuckdoc.addPic', async (uri: any) => {
      const selectedFilePath = uri.path as string
      const prefixPath = selectedFilePath.substring(
        0,
        selectedFilePath.lastIndexOf('/')
      )
      const panel = vscode.window.createWebviewPanel(
        'addPic',
        '添加图片',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media')
          ]
        }
      )

      panel.webview.onDidReceiveMessage(
        (message) => {
          const base64 = message.base64.replace(/^data:image\/\w+;base64,/, '') //去掉图片base64码前面部分data:image/png;base64
          const dataBuffer = new Buffer(base64, 'base64') //把base64码转成buffer对象，

          sharp(dataBuffer).toFile(
            `${prefixPath}/test.webp`,
            (err: any, info: any) => {
              console.log('done')
            }
          )
          console.log('dataBuffer:::', dataBuffer)
        },
        undefined,
        context.subscriptions
      )

      const scriptPath = vscode.Uri.joinPath(
        context.extensionUri,
        'media',
        'main.js'
      )
      // And the uri we use to load this script in the webview
      const scriptUri = panel.webview.asWebviewUri(scriptPath)

      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title></title>
          <link rel="icon" href="favicon.ico" type="image/x-icon" />
          <script defer src="${scriptUri}"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>

      `

      //   panel.webview.html = `
      // <textarea id="result"></textarea>
      // <img id="img-preview"/>
      // <script>
      //   document.getElementById('result').addEventListener('paste', function(e) {
      //     // 阻止粘贴
      //     e.stopPropagation();
      //     e.preventDefault();
      //     // 获取剪贴板信息
      //     var clipboardData = e.clipboardData || window.clipboardData;
      //     var items = clipboardData.items;
      //     for(var i=0; i<items.length; i++) {
      //       var item = items[i];
      //       if (item.kind == 'file') {
      //         var pasteFile = item.getAsFile();
      //         var reader = new FileReader();
      //         reader.onload = function(event) {
      //           // 将结果显示在<textarea>中
      //           document.getElementById('result').value = event.target.result;
      //           document.getElementById('img-preview').src = event.target.result;

      //           acquireVsCodeApi().postMessage({base64: event.target.result});
      //         }
      //         // 将文件读取为BASE64格式字符串
      //         reader.readAsDataURL(pasteFile);
      //         break;
      //       }
      //     }
      //   })
      // </script>
      // `
    })
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}
