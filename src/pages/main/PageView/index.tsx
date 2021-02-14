import React from 'react';
import Devices from '../Devices';
import Message from '../Message';
import PhoneList from '../PhoneList';
import Infos from '../Infos';

import styles from './index.less';

import {
  ContainerEventType,
  ContainerPropsType,
  ContainerStateType,
} from '../data';

type PropsType = ContainerEventType & ContainerPropsType & ContainerStateType;

const PageView: React.FC<PropsType> = ({
  devices,
  phoneList,
  deviceOpts,
  working,
  onDevicesRefresh,
  onDevicesChange,
  onPhoneChange,
  onMessageChange,
  onMessageSend,
}) => {
  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <PhoneList
          className={styles.phoneList}
          value={phoneList}
          onChange={onPhoneChange}
          working={working}
        />
        <Message
          className={styles.message}
          onChange={onMessageChange}
          onSend={onMessageSend}
          working={working}
        />
      </div>
      <div className={styles.right}>
        <Devices
          className={styles.devices}
          value={devices}
          working={working}
          options={deviceOpts}
          onRefresh={onDevicesRefresh}
          onChange={onDevicesChange}
        />
        <Infos className={styles.infos} />
      </div>
    </div>
  );
};

export default PageView;
