import React from 'react';
import axios from './utils/request';
import MasonryContent from './components/MasonryContent';
import ListContent from './components/ListContent';
import { GithubOutlined } from '@ant-design/icons';
import { Empty } from 'antd';

import { IData, ResourceType, ICollectItemRes } from './type';
import './App.less';

const EmptyWrapper: React.FC<{
  length?: number;
  text?: string;
  children: React.ReactElement;
}> = ({ length = 0, text, children }) => {
  if (!length) {
    return <Empty description={<span className='empty-desc'>暂无{text}，快去添加吧</span>} />;
  }

  return children;
};

const App = () => {
  const [current, setCurrent] = React.useState(ResourceType.FC);
  const [data, setData] = React.useState<IData>();

  // 请求数据，向下传递
  React.useEffect(() => {
    axios
      .get(`${process.env.HTTP_PATH}/data`)
      .then(res => {
        const { data } = res;
        setData(data);
      })
      .catch(res => {});
  }, []);

  const handleMenuChange = (type: ResourceType) => {
    setCurrent(type);
  };

  return (
    <div className='fuck-doc'>
      <div className='menu-content'>
        <div className='title-wrapper'>
          <div className='title'>Fuck Doc</div>
          <div className='desc'>去他 x 的组件文档，我不想写！</div>
        </div>

        <div className='menu'>
          <div
            className={`menu-item ${current === ResourceType.FC && 'active'}`}
            onClick={() => {
              handleMenuChange(ResourceType.FC);
            }}
          >
            组件 ( Components )
          </div>
          <div
            className={`menu-item ${current === ResourceType.FF && 'active'}`}
            onClick={() => {
              handleMenuChange(ResourceType.FF);
            }}
          >
            方法 ( Functions )
          </div>
        </div>

        <div className='menu-footer'>
          <GithubOutlined
            className='menu-icon'
            onClick={() => {
              window.open('https://github.com/xicunyang/fuckdoc');
            }}
          />
        </div>
      </div>

      <div className='card-content'>
        {current === ResourceType.FC && (
          <EmptyWrapper text='组件' length={data?.FC.length}>
            <MasonryContent items={data?.FC} />
          </EmptyWrapper>
        )}
        {current === ResourceType.FF && (
          <EmptyWrapper text='方法' length={data?.FF.length}>
            <ListContent items={data?.FF} />
          </EmptyWrapper>
        )}
      </div>
    </div>
  );
};

export default App;
