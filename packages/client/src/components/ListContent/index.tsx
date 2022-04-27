import React from 'react';
import { ICollectItemRes } from '../../type';
import CopyPre from '../CopyPre';
import { Button } from 'antd';
import { jumpToCode } from './../../utils/index';
import ParamsContent from '../ParamsContent';
import './style.less';

interface IProps {
  items?: ICollectItemRes[];
}

const ListItem: React.FC<{
  item: ICollectItemRes;
}> = ({ item }) => {
  const [loading, setLoading] = React.useState(false);

  const codePath = item.info?.startLine != null ? `${`${item.codePath || ''}:${item.info?.startLine}`}:0` : item.codePath;
  const showPath = codePath ? codePath : item.imgPath;

  return (
    <div className='list-item'>
      <div className='title'>{item.info?.title || '暂未填写标题'}</div>
      <div className='desc'>{item.info?.desc || '暂未填写描述'}</div>
      <div className='params'>
        <ParamsContent params={item.info?.params || []} width='600px' />
      </div>
      <div className='path'>
        <CopyPre text={showPath} />
      </div>
      <div className='footer'>
        <Button
          loading={loading}
          type='primary'
          onClick={async () => {
            setLoading(true);
            await jumpToCode(showPath);
            setLoading(false);
          }}
        >
          在编辑器中打开
        </Button>
      </div>
    </div>
  );
};

const ListContent: React.FC<IProps> = ({ items }) => {
  return (
    <div className='list-content'>
      {items?.map((item, index) => (
        <ListItem key={index} item={item} />
      ))}
    </div>
  );
};

export default ListContent;
