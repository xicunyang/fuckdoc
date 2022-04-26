import React from 'react';
import axios from './utils/request';
import { Tabs } from 'antd';
import ItemsTab from './components/tabs/ItemsTab';
import { IData } from './type';
const { TabPane } = Tabs;

const App = () => {
  const [current, setCurrent] = React.useState('fc');
  const [data, setData] = React.useState<IData>();

  // 请求数据，向下传递
  React.useEffect(() => {
    axios.get('http://127.0.0.1:9527/data').then(res => {
      const data = res.data;
      setData(data);
    }).catch(res => {})
  }, []);

  return (
    <div style={{padding: '15px'}}>
      <Tabs defaultActiveKey='1' onChange={() => {}}>
        <TabPane tab='组件(Components)' key='fc'>
          <ItemsTab type='fc' items={data?.fc}/>
        </TabPane>
        <TabPane tab='函数(Functions)' key='ff'>
          Content of Tab Pane 2
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
