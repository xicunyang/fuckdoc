import React from 'react';
import { ICollectItem } from '../../type';
import './style.less';
import { Card, Button } from 'antd';
import axios from './../../utils/request';

interface IProps {
  type: 'fc' | 'ff';
  items?: ICollectItem[];
}

const ItemsTab: React.FC<IProps> = ({ type, items = [] }) => {
  console.log('items:::', items);

  const handleJumpToSource = (item: ICollectItem) => {
    axios
      .get(`http://127.0.0.1:9527/open-source?path=${item.codePath}`)
      .then(res => {})
      .catch(res => {});
  };

  return (
    <div className='items-tab-wrapper'>
      {items.map((item, index) => (
        <Card key={index} className='item-card' hoverable>
          <div className='image-wrapper'>
            <img src={`http://localhost:9527/img?path=${item.imgPath}`} />
          </div>
          {item.infos && (
            <div className='info'>
              <div className='title'>标题: {item.infos[0].title}</div>
              <div className='desc'>描述: {item.infos[0].desc}</div>
            </div>
          )}

          <div className='footer'>
            <Button
              onClick={() => {
                handleJumpToSource(item);
              }}
            >
              跳转到源码
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ItemsTab;
