import React from 'react';
import classnames from 'classnames';
import styles from './index.less';
import {
  Button,
  message,
  PageHeader,
  Table,
  TableColumnProps,
  Upload,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import Message from '../Message';
import { ColumnsType } from 'antd/lib/table';

type PropsType = {
  value: string[];
  className: object;
  onChange: (phoneList: string[]) => void;
};

const PhoneList: React.FC<PropsType> = ({ value, className, onChange }) => {
  const handleOnbeforeUpload = (file: RcFile, fileList: RcFile[]) => {
    const reader = new FileReader();
    reader.readAsText(file); //读取上传文件的内容
    reader.onload = (e: any) => {
      let phoneList = e.target.result.split('\n');
      message.success(`成功添加${phoneList.length}条手机号`);
      onChange && onChange(phoneList);
    };
    return false;
  };
  const columns = [
    {
      title: '手机号',
      render: (row: string) => row,
    },
    {
      title: '发送状态',
      render: (row: string) => row,
    },
    {
      title: '操作',
      render: (row: string) => <Button type="link">删除</Button>,
    },
  ] as ColumnsType<object>;
  return (
    <PageHeader
      title="号码列表"
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
          <Button type="primary" size="small" icon={<PlusOutlined />}>
            添加
          </Button>
        </Upload>,
      ]}
    >
      <Table size="small" dataSource={value} columns={columns} />
    </PageHeader>
  );
};

export default PhoneList;
