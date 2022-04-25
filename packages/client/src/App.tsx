import React from 'react';
import axios from './utils/request';

const App = () => {
  // 请求数据，向下传递
  React.useEffect(() => {
    axios.get('http://127.0.0.1:9527/data').then(res => {
      console.log('res:::', res);
    }).catch(res => {})
  }, []);
  return <div>this is app</div>;
};

export default App;
