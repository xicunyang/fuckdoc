import React from 'react';
import { ICollectItemRes } from '../../type';
import './style.less';
import { Card, Button, Popover, Spin, Alert } from 'antd';
import Masonry from 'react-masonry-css';
import { throttle } from 'lodash-es';
import CopyPre from './../CopyPre';
import { jumpToCode } from './../../utils/index';
import ParamsContent from './../ParamsContent';

interface IProps {
  items?: ICollectItemRes[];
}

// 获取当前窗口大小
const getWindowSize = () => ({
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth
});

const PopoverContent: React.FC<{
  item: ICollectItemRes;
  easyMode?: boolean;
}> = ({ item, easyMode = false }) => {
  const [loading, setLoading] = React.useState(false);

  const codePath = item.info?.startLine != null ? `${`${item.codePath || ''}:${item.info?.startLine}`}:0` : '';
  const showPath = codePath ? codePath : item.imgPath;

  return (
    <div className='popover-content'>
      {/* 没有预览图提示 */}
      {!item.imgPath && (
        <Alert showIcon type='warning' message='组件没有预览图，快去添加吧' style={{ marginBottom: '15px' }}></Alert>
      )}


      <div className='title'>{item.info?.title ?? '暂未填写标题'}</div>
      <div className='desc'>{item.info?.desc ?? '暂未填写描述'}</div>

      {easyMode && <div className='click-and-show-more'>点击展示更多</div>}

      {!easyMode && (
        <>
          <div className='params'>
            <ParamsContent params={item.info?.params || []} />
          </div>

          <div className='paths'>
            <CopyPre text={showPath} />
          </div>

          <div className='footer'>
            <Button
              style={{ width: '100%' }}
              loading={loading}
              type='primary'
              onClick={async () => {
                let { codePath } = item;
                if (item.info?.startLine) {
                  codePath += `:${item.info?.startLine}:0`;
                }
                setLoading(true);
                await jumpToCode(codePath ?? item.imgPath);
                setLoading(false);
              }}
            >
              在编辑器中打开
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const MasonryContent: React.FC<IProps> = ({ items = [] }) => {
  // 瀑布流列数
  const [breakpointCols, setBreakpointCols] = React.useState(2);
  // 激活的index
  const [activedIndex, setActivedIndex] = React.useState(-1);
  // 当前是否是激活模式
  const [isActiving, setIsActiving] = React.useState(false);
  // 当前是否在loading中
  const [loading, setLoading] = React.useState(true);

  const handleDisableActiving = () => {
    setActivedIndex(-1);
    setIsActiving(false);
  };

  // 处理浏览器onsize
  const handleResize = () => {
    const { innerWidth } = getWindowSize();
    setBreakpointCols(Math.floor((innerWidth - 300) / 400) + 1);
  };

  // 处理按键按下
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.which === 27) {
      handleDisableActiving();
    }
  };

  React.useLayoutEffect(() => {
    setTimeout(() => {
      // 模拟loading
      setLoading(false);
    }, 500);

    handleResize();

    // 监听
    window.addEventListener('resize', throttle(handleResize, 500));
    window.addEventListener('keydown', handleKeydown);
    // 初始化加载
    // 销毁
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // 卡片被点击
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    const tabItemWrapper = document.querySelector('.tab-item-wrapper');
    const scrollTop = tabItemWrapper?.scrollTop || 0;

    // @ts-ignore
    const { y, height } = e.target.getBoundingClientRect();

    // 上面被遮挡
    if (y < 0) {
      tabItemWrapper?.scrollTo({
        top: scrollTop + y - 120
      });
    }

    // 下面被遮挡
    if (height + y > window.innerHeight) {
      tabItemWrapper?.scrollTo({
        top: scrollTop + height + y - window.innerHeight + 120
      });
    }

    setActivedIndex(index);
    setIsActiving(true);
  };

  return (
    <div className={`tab-item-wrapper ${isActiving ? 'disable-scroll' : ''}`}>
      <Spin spinning={loading}>
        <Masonry breakpointCols={breakpointCols} className='my-masonry-grid' columnClassName='my-masonry-grid_column'>
          {[...items].map((item, index) => (
            <Popover
              key={index}
              placement='right'
              content={<PopoverContent item={item} />}
              title={<div className='popover-title'>组件详情</div>}
              visible={index === activedIndex && isActiving}
              arrowPointAtCenter
            >
              <Card
                className={`item-card ${index === activedIndex ? 'card-activing' : ''}`}
                hoverable
                onClick={e => {
                  handleCardClick(e, index);
                }}
              >
                {item.imgPath ? (
                  <div className='image-wrapper'>
                    <img src={`http://localhost:9527/img?path=${item.imgPath}`} />
                  </div>
                ) : (
                  <div>
                    <PopoverContent item={item} easyMode />
                  </div>
                )}
              </Card>
            </Popover>
          ))}
        </Masonry>
      </Spin>
      {isActiving && <div className='tab-mask' onClick={handleDisableActiving}></div>}
    </div>
  );
};

export default MasonryContent;
