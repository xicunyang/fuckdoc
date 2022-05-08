import React from 'react';
import './App.less';
import { Input, Upload, message, Button, Spin } from 'antd';
import { InboxOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

const { TextArea } = Input;
const { Dragger } = Upload;

declare const window: {
  _vscode: any;
  clipboardData: any;
  _fuckdoc_current_component_path: string;
  [index: string]: any;
};

function transform2Webp(file: RcFile): Promise<string> {
  return new Promise((r, j) => {
    try {
      const reader = new FileReader();
      reader.onload = function (event) {
        // 将结果显示在<textarea>中
        const base64 = event?.target?.result as string;

        const image = new Image();
        image.onload = () => {
          // 普通图片 转 webp
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          canvas.getContext('2d')?.drawImage(image, 0, 0);
          canvas.toBlob(b => {
            const blob = b as Blob;
            const myImage = new File([blob], 'my-new-name.webp', { type: blob.type });
            const reader = new FileReader();
            reader.onload = event => {
              const base64 = event?.target?.result as string;
              r(base64);
            };
            reader.readAsDataURL(myImage);
          }, 'image/webp');
        };

        image.src = base64;
      };
      // 将文件读取为BASE64格式字符串
      reader.readAsDataURL(file);
    } catch (e) {
      j(e);
    }
  });
}

const App = () => {
  const [pasteLoading, setPasteloading] = React.useState(false);
  const [updateLoading, setUpdateloading] = React.useState(false);
  const [globalLoading, setGlobalLoading] = React.useState(false);
  const [imageSrcArr, setImageSrcArr] = React.useState<string[]>(window._vscode.getState() || []);

  React.useEffect(() => {
    window._vscode.setState(imageSrcArr);
  }, [imageSrcArr]);

  React.useEffect(() => {
    let failCount = 0;
    let successCount = 0;

    const handleMessage = (event: any) => {
      const msg = event.data;
      const { type } = msg;
      if (type === 'CREATE_IMG_DONE') {
        successCount += 1;
        if (msg.index + 1 === imageSrcArr.length) {
          setGlobalLoading(false);
          setImageSrcArr([]);
          message.success(`完成！成功 ${successCount} 个，失败 ${failCount} 个`);
        }
      } else if (type === 'CREATE_IMG_ERROR') {
        failCount += 1;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [imageSrcArr]);

  React.useEffect(() => {
    const pasteBlock = document.getElementById('paste-block');
    const handlePaste = async (e: any) => {
      if (pasteLoading) {
        return;
      }
      setPasteloading(true);
      const clipboardData = e.clipboardData || window.clipboardData;
      const { items } = clipboardData;
      let hasFile = false;

      try {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind == 'file') {
            hasFile = true;
            const pasteFile = item.getAsFile();
            const newFileBase64 = await transform2Webp(pasteFile);
            setImageSrcArr([...imageSrcArr, newFileBase64]);
          }
        }

        if (!hasFile) {
          message.warning('没有粘贴进来合适的图片');
        } else {
          message.success('已添加到预览区域');
        }
      } catch (e) {
        message.error(String(e));
      }

      setPasteloading(false);
    };

    pasteBlock?.addEventListener('paste', handlePaste);

    return () => {
      pasteBlock?.removeEventListener('paste', handlePaste);
    };
  }, [imageSrcArr, pasteLoading]);

  return (
    <div className='fuck-doc-extension'>
      <div className='component-title'>当前文件：{window._fuckdoc_current_component_path}</div>
      <div className='submit-panel'>
        <Button
          type='primary'
          size='middle'
          loading={globalLoading}
          onClick={() => {
            if (!imageSrcArr.length) {
              message.warning('请先添加图片');
              return;
            }
            window._vscode.postMessage({ imgArr: imageSrcArr, type: 'CREATE_IMG' });
          }}
        >
          保存到目录
        </Button>
      </div>
      <div className='upload-panel'>
        <div className='paste-block'>
          <Spin spinning={pasteLoading}>
            <div className='paste-block-absolute'>
              <CopyOutlined className='paste-icon' />
              <p className='paste-text'>在此处粘贴你的图片</p>
            </div>
            <TextArea id='paste-block' className='paste-area' value=''></TextArea>
          </Spin>
        </div>
        <div className='upload-block'>
          <Spin spinning={updateLoading} style={{ height: '300px' }}>
            <Dragger
              name='file'
              accept='image/*'
              beforeUpload={async info => {
                setUpdateloading(true);

                try {
                  const newFileBase64 = await transform2Webp(info);
                  setImageSrcArr([...imageSrcArr, newFileBase64]);
                  message.success('已添加到预览区域');
                } catch (e) {
                  message.error(String(e));
                }

                setUpdateloading(false);
                return false;
              }}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>在此处选择你的本地图片</p>
            </Dragger>
          </Spin>
        </div>
      </div>

      <div className='preview-panel'>
        <div className='preview-title'>{imageSrcArr.length > 0 ? '图片预览:' : '图片预览: 暂无图片'}</div>
        <div className='preview-item-wrapper'>
          {imageSrcArr.map((item, idx) => (
            <div key={idx}>
              <div
                className='close-icon'
                onClick={() => {
                  imageSrcArr.splice(idx, 1);
                  setImageSrcArr([...imageSrcArr]);
                }}
              >
                <DeleteOutlined className='delete-icon' />
              </div>
              <img src={item} width='100%' />
            </div>
          ))}
        </div>
      </div>

      {/* <Modal
        title='确认是否是该图片？'
        visible={previewModal}
        onCancel={() => {
          setPreviewModal(false);
        }}
        onOk={() => {
          setPreviewModal(false);
        }}
      >
        <img src='' />
      </Modal> */}
    </div>
  );
};

export default App;
