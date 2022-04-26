import React, { MutableRefObject } from 'react';
import { ICollectItemRes } from '../../type';
import './style.less';
import { Card, Button, Popover, message, Spin } from 'antd';
import axios from '../../utils/request';
import Masonry from 'react-masonry-css';
import { throttle } from 'lodash-es';
import copy from 'copy-to-clipboard';

interface IProps {
  type: 'fc' | 'ff';
  items?: ICollectItemRes[];
}

// 获取当前窗口大小
const getWindowSize = () => ({
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth
});

const PopoverContent: React.FC<{
  item: ICollectItemRes;
}> = ({ item }) => {
  const [loading, setLoading] = React.useState(false);

  const codePath = item.info?.startLine != null ? `${`${item.codePath || ''}:${item.info?.startLine}`}:0` : '';
  const showPath = codePath ? codePath : item.imgPath;

  const jumpToCode = (sourcePath?: string) => {
    if (!sourcePath) {
      message.warn('未找到path，暂无法跳转');
      return;
    }

    setLoading(true);

    axios
      .get(`http://127.0.0.1:9527/open-source?path=${sourcePath}`)
      .then((res: any) => {
        const { success } = res;
        if (success) {
          message.success('打开成功');
        }
      })
      .catch(res => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className='popover-content'>
      <div className='title'>{item.info?.title ?? '暂未填写标题'}</div>
      <div className='desc'>{item.info?.desc ?? '暂未填写描述'}</div>

      <div
        className='paths'
        onClick={() => {
          copy(showPath || '');
          message.success('复制成功');
        }}
      >
        {showPath}
      </div>

      <div className='footer'>
        <Button
          style={{ width: '100%' }}
          loading={loading}
          type='primary'
          onClick={() => {
            let { codePath } = item;
            if (item.info?.startLine) {
              codePath += `:${item.info?.startLine}:0`;
            }
            jumpToCode(codePath ?? item.imgPath);
          }}
        >
          在vscode中打开
        </Button>
      </div>
    </div>
  );
};

const TabItem: React.FC<IProps> = ({ type, items = [] }) => {
  const [breakpointCols, setBreakpointCols] = React.useState(2);
  const [activedIndex, setActivedIndex] = React.useState(-1);
  const [isActiving, setIsActiving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  // const wrapperRef: MutableRefObject<any> = React.useRef(null);

  const handleDisableActiving = () => {
    setActivedIndex(-1);
    setIsActiving(false);
  };

  const handleResize = () => {
    const { innerWidth } = getWindowSize();
    setBreakpointCols(Math.floor((innerWidth - 300) / 400) + 1);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.which === 27) {
      handleDisableActiving();
    }
  };

  React.useLayoutEffect(() => {
    setTimeout(() => {
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    const tabItemWrapper = document.querySelector('.tab-item-wrapper');
    const scrollTop = tabItemWrapper?.scrollTop || 0;

    // @ts-ignore
    const { y, height } = e.target.getBoundingClientRect();

    if (y < 0) {
      tabItemWrapper?.scrollTo({
        top: scrollTop + y - 120
      });
    }

    if (height + y > window.innerHeight) {
      tabItemWrapper?.scrollTo({
        top: scrollTop + height + y - window.innerHeight + 120
      });
    }

    setActivedIndex(index);
    setIsActiving(true);
  };

  console.log('items:::', items);

  return (
    <div className={`tab-item-wrapper ${isActiving ? 'disable-scroll' : ''}`}>
      <Spin spinning={loading}>
        <Masonry breakpointCols={breakpointCols} className='my-masonry-grid' columnClassName='my-masonry-grid_column'>
          {[...items].map((item, index) => (
            <Popover
              key={index}
              placement='right'
              content={<PopoverContent item={item} />}
              title='详情'
              visible={index === activedIndex && isActiving}
            >
              <Card
                className={`item-card ${index === activedIndex ? 'card-activing' : ''}`}
                hoverable
                onClick={e => {
                  if (!item.imgPath) {
                    return;
                  }

                  handleCardClick(e, index);
                }}
              >
                {item.imgPath ? (
                  <div className='image-wrapper'>
                    <img src={`http://localhost:9527/img?path=${item.imgPath}`} />
                  </div>
                ) : (
                  <div>
                    <PopoverContent item={item} />
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

export default TabItem;
