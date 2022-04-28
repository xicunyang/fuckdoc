import { message } from 'antd';
import axios from './request';

export const jumpToCode = (sourcePath?: string) =>
  new Promise(r => {
    if (!sourcePath) {
      message.warn('未找到path，暂无法跳转');
      return r(true);
    }

    axios
      .get(`${process.env.HTTP_PATH}/open-source?path=${sourcePath}`)
      .then((res: any) => {
        const { success, msg } = res;
        if (success) {
          message.success('打开成功');
          r(true);
        } else {
          message.error(msg);
        }
      })
      .catch(e => {
        message.error(String(e));
      })
      .finally(() => {
        r(true);
      });
  });

export const getImageUrl = (imgPath = '') => {
  return `${process.env.HTTP_PATH}/img?path=${imgPath}`;
}