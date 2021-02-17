import React from 'react';
import classnames from 'classnames';

import styles from './index.less';

type PropsType = {
  className: object;
};

const Infos: React.FC<PropsType> = ({ className }) => {
  return <div className={classnames(styles.main, className)}></div>;
};

export default Infos;
