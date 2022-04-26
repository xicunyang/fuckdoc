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

  return (
    <div className='fuck-doc'>
      <div className='menu-content'>
        <div className='title-wrapper'>
          <div className='title'>Fuck Doc</div>
          <div className='desc'>去他的组件文档，我不想写！</div>
        </div>

        <div className="menu">
          <div className='menu-item'>组件 ( Components )</div>
          <div className='menu-item'>方法 ( Functions )</div>
        </div>
      </div>

      <div className='card-content'>
        <ItemsTab type='fc' items={data?.fc}/>
      </div>
      {/* <Tabs defaultActiveKey='1' onChange={() => {}} tabPosition='left'>
        <TabPane tab='组件(Components)' key='fc'>
          <ItemsTab type='fc' items={data?.fc}/>
        </TabPane>
        <TabPane tab='函数(Functions)' key='ff'>
          Content of Tab Pane 2
        </TabPane>
      </Tabs> */}
    </div>
  );
};

export default App;
