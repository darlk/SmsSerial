import React from 'react';
import styles from './index.less';

type PropsType = {};

type StateType = {};

class Main extends React.PureComponent<PropsType, StateType> {
  render() {
    return <div className={styles.main}>main</div>;
  }
}

export default Main;
