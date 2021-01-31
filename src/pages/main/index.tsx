import React from 'react';
import PageView from './PageView';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import produce from 'immer';

import {
  ContainerEventType,
  ContainerPropsType,
  ContainerStateType,
} from './data';

import { mockDevices } from './mockData';
import { IPCSignals } from '../../utils/constants';

type PropsType = ContainerPropsType;

type StateType = ContainerStateType;

class Main extends React.PureComponent<PropsType, StateType> {
  event: ContainerEventType;

  constructor(props: PropsType) {
    super(props);

    this.state = {
      deviceOpts: mockDevices,
      devices: [],
      phoneList: [],
      message: '',
    };

    this.event = {
      onDevicesRefresh: this._handleOnDevicesRefresh,
      onDevicesChange: this._handleOnDevicesChange,
      onPhoneChange: this._handleOnPhoneChange,
      onMessageChange: this._handleOnMessageChange,
      onMessageSend: this._handleOnMessageSend,
    };
  }

  componentDidMount() {
    ipcRenderer.on(
      IPCSignals.RENDER_MSG_RECEIVER_REFRESH,
      (event: IpcRendererEvent, result: any) => {
        console.log(result);
      }
    );
    ipcRenderer.on(
      IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT,
      (event: IpcRendererEvent, result: any) => {
        console.log(result);
      }
    );
  }

  _handleOnDevicesChange = (devices: string[]) => {
    this.setState({
      devices,
    });
  };

  _handleOnDevicesRefresh = () => {
    ipcRenderer.send(IPCSignals.MAIN_MSG_RECEIVER_REFRESH);
  };

  _handleOnPhoneChange = (phoneList: string[]) => {
    this.setState({
      phoneList: produce(this.state.phoneList, (draftState) => {
        return draftState.concat(phoneList);
      }),
    });
  };

  _handleOnMessageChange = (msg: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      message: msg.target.value,
    });
  };

  _handleOnMessageSend = () => {
    const { phoneList, message, devices } = this.state;
    console.log({ phoneList, message, devices });
  };

  render() {
    return <PageView {...this.props} {...this.state} {...this.event} />;
  }
}

export default Main;
