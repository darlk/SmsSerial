import React from 'react';
import classnames from 'classnames';
import { Button, Checkbox, PageHeader, Spin } from 'antd';
import styles from './index.less';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { PortOptionType } from '../data.d';

type PropsType = {
  className: object;
  loading: boolean;
  value: string[];
  working: boolean;
  options: Array<PortOptionType>;
  onChange: (devices: any) => void;
  onRefresh: () => void;
};

const Devices: React.FC<PropsType> = ({
  className,
  loading,
  options,
  value = [],
  working,
  onRefresh,
  onChange,
}) => {
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [isAllChecked, setAllChecked] = React.useState(false);

  React.useEffect(() => {
    // console.log({options})
    const isAll = options.length > 0 ? value.length === options.length : false;
    const isInd = !isAll && value.length > 0;
    setAllChecked(isAll);
    setIndeterminate(isInd);
  }, [value]);

  const handleOnAllCheck = (e: CheckboxChangeEvent) => {
    onChange(e.target.checked ? options.map((obj: any) => obj.value) : []);
  };
  return (
    <PageHeader
      className={classnames(styles.main, className)}
      title="设备列表"
      extra={[
        <Button
          disabled={working}
          type="primary"
          size="small"
          onClick={onRefresh}
        >
          刷新
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {options.length ? (
          <div className={styles.content}>
            <Checkbox
              disabled={working}
              indeterminate={indeterminate}
              checked={isAllChecked}
              onChange={handleOnAllCheck}
            >
              全选
            </Checkbox>
            <Checkbox.Group
              disabled={working}
              className={styles.devices}
              options={options}
              value={value}
              onChange={onChange}
            />
          </div>
        ) : (
          ''
        )}
      </Spin>
    </PageHeader>
  );
};

export default Devices;
