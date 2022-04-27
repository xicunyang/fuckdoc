import React from 'react';
import { IParams } from './../../type';
import { Table } from 'antd';
import './style.less';

const ParamsContent: React.FC<{
  params?: IParams[];
  width?: string;
}> = ({ params, width }) => (
  <div className='params-content'>
    <Table
      style={{
        width: width
      }}
      rowKey="name"
      scroll={{ y: 350 }}
      locale={{
        emptyText: '暂未填写属性'
      }}
      columns={[
        {
          title: '属性名',
          dataIndex: 'name',
          key: 'name',
          width: '130px'
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
          width: '100px'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        }
      ]}
      dataSource={params}
      pagination={false}
    />
  </div>
);

export default ParamsContent;
