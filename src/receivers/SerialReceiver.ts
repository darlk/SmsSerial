import { IpcMain, ipcRenderer } from 'electron';
import { IPCSignals } from '../utils/constants';
import SerialPort from 'serialport';

class SerialReceiver {
  constructor(ipcMain: IpcMain) {
    ipcMain.on(IPCSignals.MAIN_MSG_RECEIVER_REFRESH, this._handleOnRefresh);
    ipcMain.on(
      IPCSignals.MAIN_MSG_RECEIVER_SEND_MESSAGE,
      this._handleOnSendMessage
    );
    ipcMain.on(
      IPCSignals.MAIN_MSG_RECEIVER_SEND_MESSAGE_STOP,
      this._handleOnStop
    );
  }

  _handleOnRefresh = (event: Electron.IpcMainEvent, args: any) => {
    SerialPort.list().then((ports: any) => {
      event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_REFRESH, {
        devices: ports,
      });
    });
  };

  _handleOnSendMessage = (event, args) => {};

  _handleOnStop = (event, args) => {};
}

export default SerialReceiver;
