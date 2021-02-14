import React from 'react';
import classnames from 'classnames';
import styles from './index.less';
import { Button, Input, PageHeader } from 'antd';

type PropsType = {
  className: object;
  working: boolean;
  onChange: (msg: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};

const Message: React.FC<PropsType> = ({
  working,
  className,
  onChange,
  onSend,
}) => {
  return (
    <PageHeader
      title="短信内容"
      className={classnames(styles.main, className)}
      extra={[
        <Button disabled={working} type="primary" size="small" onClick={onSend}>
          发送
        </Button>,
      ]}
    >
      <Input.TextArea
        disabled={working}
        autoSize={{ maxRows: 4, minRows: 4 }}
        onChange={onChange}
      />
    </PageHeader>
  );
};

export default Message;
