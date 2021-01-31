import React from 'react';
import classnames from 'classnames';
import { Button, Checkbox, PageHeader } from 'antd';
import styles from './index.less';
import { EventType } from '@testing-library/react';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

type PropsType = {
  className: object;
  value: string[];
  options: Array<string>;
  onChange: (devices: any) => void;
  onRefresh: () => void;
};

const Devices: React.FC<PropsType> = ({
  className,
  options,
  value = [],
  onRefresh,
  onChange,
}) => {
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [isAllChecked, setAllChecked] = React.useState(false);

  React.useEffect(() => {
    const isAll = value.length === options.length;
    const isInd = !isAll && value.length > 0;
    setAllChecked(isAll);
    setIndeterminate(isInd);
  }, [value]);

  const handleOnAllCheck = (e: CheckboxChangeEvent) => {
    onChange(e.target.checked ? options.slice() : []);
  };
  return (
    <PageHeader
      className={classnames(styles.main, className)}
      title="设备列表"
      extra={[
        <Button type="primary" size="small" onClick={onRefresh}>
          刷新
        </Button>,
      ]}
    >
      <Checkbox
        indeterminate={indeterminate}
        checked={isAllChecked}
        onChange={handleOnAllCheck}
      >
        全选
      </Checkbox>
      <Checkbox.Group
        className={styles.devices}
        options={options}
        value={value}
        onChange={onChange}
      />
    </PageHeader>
  );
};

export default Devices;
