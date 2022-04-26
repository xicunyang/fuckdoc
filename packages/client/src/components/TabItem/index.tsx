import React, { MutableRefObject } from 'react';
import { ICollectItemRes } from '../../type';
import './style.less';
import { Card, Button, Popover } from 'antd';
import axios from '../../utils/request';
import Masonry from 'react-masonry-css';
import { throttle } from 'lodash-es';

interface IProps {
  type: 'fc' | 'ff';
  items?: ICollectItemRes[];
}

// 获取当前窗口大小
const getWindowSize = () => ({
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth
});

const TabItem: React.FC<IProps> = ({ type, items = [] }) => {
  const [breakpointCols, setBreakpointCols] = React.useState(2);
  const [activedIndex, setActivedIndex] = React.useState(-1);
  const [isActiving, setIsActiving] = React.useState(false);
  // const wrapperRef: MutableRefObject<any> = React.useRef(null);

  const handleResize = () => {
    const { innerWidth } = getWindowSize();
    setBreakpointCols(Math.floor(innerWidth / 400) - 1);
  };

  React.useLayoutEffect(() => {
    handleResize();
    // 监听
    window.addEventListener('resize', throttle(handleResize, 500));
    // 初始化加载
    // 销毁
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleJumpToSource = (item: ICollectItemRes) => {
    axios
      .get(`http://127.0.0.1:9527/open-source?path=${item.codePath}`)
      .then(res => {})
      .catch(res => {});
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    const tabItemWrapper = document.querySelector('.tab-item-wrapper');
    const scrollTop = tabItemWrapper?.scrollTop || 0;

    // @ts-ignore
    const { y } = e.target.getBoundingClientRect();

    if (y < 0) {
      tabItemWrapper?.scrollTo({
        top: scrollTop + y - 120
      });
    }

    setActivedIndex(index);
    setIsActiving(true);
  };

  return (
    <div className={`tab-item-wrapper ${isActiving ? 'disable-scroll' : ''}`}>
      <Masonry breakpointCols={breakpointCols} className='my-masonry-grid' columnClassName='my-masonry-grid_column'>
        {[...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items].map((item, index) => (
          <Popover
            placement='right'
            content={<div>this is content</div>}
            title='Title'
            visible={index === activedIndex && isActiving}
          >
            <Card
              key={index}
              className={`item-card ${index === activedIndex ? 'card-activing' : ''}`}
              hoverable
              onClick={e => {
                handleCardClick(e, index);
              }}
            >
              <div className='image-wrapper'>
                <img src={`http://localhost:9527/img?path=${item.imgPath}`} />
              </div>
            </Card>
          </Popover>
        ))}
      </Masonry>

      {isActiving && (
        <div
          className='tab-mask'
          onClick={() => {
            setActivedIndex(-1);
            setIsActiving(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default TabItem;
