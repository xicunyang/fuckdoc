import React from 'react';
import './style.less';
import copy from 'copy-to-clipboard';
import { message } from 'antd';

interface IProps {
  text?: string;
}

const CopyPre: React.FC<IProps> = ({ text = '' }) => (
  <div
    className='copy-pre'
    onClick={() => {
      copy(text);
      message.success('ε€εΆζε');
    }}
  >
    {text}
  </div>
);

export default CopyPre;
