import React from 'react';
import { ICollectItemRes } from '../../type';
import './style.less';
import { Card, Button } from 'antd';
import axios from '../../utils/request';
import Masonry from 'react-masonry-css';
import {throttle} from 'lodash-es'

interface IProps {
  type: 'fc' | 'ff';
  items?: ICollectItemRes[];
}

const TabItem: React.FC<IProps> = ({ type, items = [] }) => {
  const [breakpointCols, setBreakpointCols] = React.useState(2);

   //获取当前窗口大小
   const getWindowSize = () => ({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
  });

  // const [windowSize, setWindowSize] = React.useState(getWindowSize());

  const handleResize = () => {
    const {innerWidth} = getWindowSize();
    setBreakpointCols(Math.floor(innerWidth / 400) - 1);
  };

  React.useLayoutEffect(() => {
    handleResize();
    // 监听
    window.addEventListener("resize", throttle(handleResize, 500));
    //初始化加载
    // 销毁
    return () => window.removeEventListener("resize", handleResize);
  },[]);

  const handleJumpToSource = (item: ICollectItemRes) => {
    axios
      .get(`http://127.0.0.1:9527/open-source?path=${item.codePath}`)
      .then(res => {})
      .catch(res => {});
  };

  return (
    <div className='tab-item-wrapper'>
      <Masonry breakpointCols={breakpointCols} className='my-masonry-grid' columnClassName='my-masonry-grid_column'>
        {[...items,...items,...items,...items,...items,...items,...items,...items].map((item, index) => (
          <Card key={index} className='item-card' hoverable>
            <div className='image-wrapper'>
              <img src={`http://localhost:9527/img?path=${item.imgPath}`} />
            </div>
            {/* {item.infos && (
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
          </div> */}
          </Card>
        ))}
      </Masonry>
    </div>
  );
};

export default TabItem;
