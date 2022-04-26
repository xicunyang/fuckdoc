import React from 'react';
import axios from './utils/request';
import { Tabs } from 'antd';
import ItemsTab from './components/TabItem';
import { IData } from './type';
import './App.less';

const { TabPane } = Tabs;

const App = () => {
  const [current, setCurrent] = React.useState('fc');
  const [data, setData] = React.useState<IData>();

  // 请求数据，向下传递
  React.useEffect(() => {
    axios
      .get('http://127.0.0.1:9527/data')
      .then(res => {
        const { data } = res;
        console.log('data:::', data);

        setData(data);
      })
      .catch(res => {});
  }, []);

  const handleMenuChange = (type: 'fc' | 'ff') => {
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
            className={`menu-item ${current === 'fc' && 'active' }`}
            onClick={() => {
              handleMenuChange('fc');
            }}
          >
            组件 ( Components )
          </div>
          <div
            className={`menu-item ${current === 'ff' && 'active' }`}
            onClick={() => {
              handleMenuChange('ff');
            }}
          >
            方法 ( Functions )
          </div>
        </div>
      </div>

      <div className='card-content'>
        {current === 'fc' && <ItemsTab type='fc' items={data?.fc} />}
        {current === 'ff' && <div style={{
          padding: '20px',
          fontSize: '30px',
          fontWeight: 200
        }}>It's coming soon</div>}
      </div>
    </div>
  );
};

export default App;
