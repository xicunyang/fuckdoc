import React from 'react';
import axios from './utils/request';
import MasonryContent from './components/MasonryContent';
import ListContent from './components/ListContent';
import { GithubOutlined } from '@ant-design/icons';

import { IData, ResourceType } from './type';
import './App.less';

const App = () => {
  const [current, setCurrent] = React.useState(ResourceType.FC);
  const [data, setData] = React.useState<IData>();

  // 请求数据，向下传递
  React.useEffect(() => {
    axios
      .get('http://127.0.0.1:9527/data')
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
          <GithubOutlined className='menu-icon'/>
        </div>
      </div>

      <div className='card-content'>
        {current === ResourceType.FC && <MasonryContent items={data?.FC} />}
        {current === ResourceType.FF && <ListContent items={data?.FF} />}
      </div>
    </div>
  );
};

export default App;
