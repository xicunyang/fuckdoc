import { message } from 'antd';
import axios from './request';

export const jumpToCode = (sourcePath?: string) =>
  new Promise(r => {
    if (!sourcePath) {
      message.warn('未找到path，暂无法跳转');
      return r(true);
    }

    axios
      .get(`http://127.0.0.1:9527/open-source?path=${sourcePath}`)
      .then((res: any) => {
        const { success } = res;
        if (success) {
          message.success('打开成功');
          r(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        r(true);
      });
  });
