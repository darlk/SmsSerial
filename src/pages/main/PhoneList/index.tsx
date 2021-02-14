import React from 'react';
import classnames from 'classnames';
import { Button, message, PageHeader, Table, Tag, Upload } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { ColumnsType } from 'antd/lib/table';
import _ from 'lodash';
import { PhoneOptionType } from '../data.d';

import styles from './index.less';
import produce from 'immer';

type PropsType = {
  value: Array<PhoneOptionType>;
  className: object;
  working: boolean;
  onChange: (phoneList: Array<PhoneOptionType>) => void;
};

const PhoneList: React.FC<PropsType> = ({
  value = [],
  className,
  working,
  onChange,
}) => {
  const handleOnbeforeUpload = (file: RcFile, fileList: RcFile[]) => {
    const reader = new FileReader();
    reader.readAsText(file); //读取上传文件的内容
    reader.onload = (e: any) => {
      const phoneList: Array<PhoneOptionType> = e.target.result
        .split('\n')
        .map((val: string) => ({
          id: val + Math.random(),
          phone: val,
          status: 0,
        }));
      message.success(`成功添加${phoneList.length}条手机号`);
      onChange && onChange(phoneList);
    };
    return false;
  };
  const handleOnDelete = (index: number) => {
    onChange &&
      onChange(
        produce(value, (drafState) => {
          drafState.splice(index, 1);
        })
      );
  };
  const columns = [
    {
      title: '手机号',
      key: 'phone',
      dataIndex: 'phone',
    },
    {
      title: '发送状态',
      key: 'status',
      dataIndex: 'status',
      render: (val: number) => getTag(val),
    },
    {
      title: '操作',
      key: 'control',
      width: 80,
      render: (val: any, row: PhoneOptionType, idx: number) => (
        <Button
          disabled={working}
          type="link"
          onClick={() => handleOnDelete(idx)}
        >
          删除
        </Button>
      ),
    },
  ] as ColumnsType<PhoneOptionType>;

  const getTag = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            发送成功
          </Tag>
        );
      case 2:
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            发送失败
          </Tag>
        );
      case 0:
      default:
        return '';
    }
  };

  return (
    <PageHeader
      title={`号码列表 ${value.length ? `- 共${value.length}条` : ''}`}
      className={classnames(styles.main, className)}
      extra={[
        <Upload
          action="#"
          name="phoneList"
          listType="text"
          accept=".txt"
          beforeUpload={handleOnbeforeUpload}
          showUploadList={false}
        >
          <Button
            disabled={working}
            type="primary"
            size="small"
            icon={<PlusOutlined />}
          >
            添加
          </Button>
        </Upload>,
      ]}
    >
      <Table
        size="small"
        rowKey="id"
        dataSource={value}
        columns={columns}
        pagination={false}
        scroll={{ y: 360, x: '100%' }}
      />
    </PageHeader>
  );
};

export default PhoneList;
