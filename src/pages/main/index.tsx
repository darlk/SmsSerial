import React from 'react';
import PageView from './PageView';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import produce from 'immer';
import { message as antMessage } from 'antd';

import {
  ContainerEventType,
  ContainerPropsType,
  ContainerStateType,
  PhoneOptionType,
} from './data';

import { IPCSignals } from '../../utils/constants';

type PropsType = ContainerPropsType;

type StateType = ContainerStateType;

class Main extends React.PureComponent<PropsType, StateType> {
  event: ContainerEventType;

  constructor(props: PropsType) {
    super(props);

    this.state = {
      deviceOpts: [],
      devices: [],
      phoneList: [],
      message: '',
      working: false,
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
      IPCSignals.RENDER_MSG_RECEIVER_ERROR_MSG,
      (event: IpcRendererEvent, result: any) => {
        console.log(result);
      }
    );
    ipcRenderer.on(
      IPCSignals.RENDER_MSG_RECEIVER_REFRESH,
      (event: IpcRendererEvent, result: any) => {
        console.log(result);
        const { deviceOpts } = result;
        this.setState({
          deviceOpts,
        });
      }
    );
    ipcRenderer.on(
      IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT,
      (event: IpcRendererEvent, result: any) => {
        // console.log(result);
        const { phone, status, leftErr, finish } = result;
        if (leftErr) {
          this.setState({
            working: false,
            phoneList: produce(this.state.phoneList, (draftState) => {
              const tarIdx = draftState.findIndex(
                (obj: PhoneOptionType) => obj.id === phone
              );
              if (tarIdx > -1) {
                for (let i = tarIdx; i < draftState.length; i++) {
                  draftState[i].status = 2;
                }
              }
            }),
          });
          return;
        }
        this.setState({
          working: !finish,
          phoneList: produce(this.state.phoneList, (draftState) => {
            const tarObj = draftState.find(
              (obj: PhoneOptionType) => obj.phone === phone
            );
            if (tarObj) {
              tarObj.status = status ? 1 : 0;
            }
          }),
        });
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

  _handleOnPhoneChange = (phoneList: Array<PhoneOptionType>) => {
    this.setState({
      phoneList,
    });
  };

  _handleOnMessageChange = (msg: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      message: msg.target.value,
    });
  };

  _handleOnMessageSend = () => {
    const { phoneList, message, devices } = this.state;
    // console.log({ phoneList, message, devices });
    if (!phoneList.length) {
      antMessage.error('手机列表为空');
      return;
    }
    if (!message) {
      antMessage.error('短信内容为空');
      return;
    }
    if (!devices.length) {
      antMessage.error('设备列表为空');
      return;
    }

    this.setState(
      {
        working: true,
        phoneList: produce(this.state.phoneList, (draftState) => {
          draftState.forEach((obj: PhoneOptionType) => (obj.status = 0));
        }),
      },
      () => {
        ipcRenderer.send(IPCSignals.MAIN_MSG_RECEIVER_SEND_MESSAGE, {
          phones: phoneList.map((obj: PhoneOptionType) => obj.phone),
          message,
          devices,
        });
      }
    );
  };

  render() {
    return <PageView {...this.props} {...this.state} {...this.event} />;
  }
}

export default Main;
