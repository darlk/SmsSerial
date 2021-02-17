import { ipcMain, ipcRenderer } from 'electron';
import { IPCSignals } from '../utils/constants';
import SerialPort from 'serialport';
import PDU from 'node-sms-pdu';

import { initModem, delay } from '../utils/utils';

const venderList = ['1a86', '2c7c'];

class SerialReceiver {
  modems: any = {};
  tryCount: number = 0;

  constructor() {
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

  _handleOnRefresh = async (event: Electron.IpcMainEvent, args: any) => {
    // console.log('main _handleOnRefresh');
    const ports = await SerialPort.list();
    this.modems = {};
    this.tryCount = 0;
    let deviceOpts = [];

    for await (const port of ports) {
      const venderId = port.vendorId?.toLocaleLowerCase() || '';
      if (venderId && venderList.includes(venderId)) {
        try {
          const modemObj: any = await initModem(port.path);
          this.modems[port.path] = modemObj;
          this.tryCount++;
          deviceOpts.push({
            value: port.path,
            label: port.path.substring(port.path.lastIndexOf('/') + 1),
          });
        } catch (error) {
          event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_ERROR_MSG, {
            error,
          });
        }
      }
    }

    event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_REFRESH, {
      deviceOpts,
    });
  };

  _handleOnSendMessage = async (event: Electron.IpcMainEvent, args: any) => {
    // console.log({ type: 'main _handleOnSendMessage', args });
    const getDevices = (dNum: number): any => {
      const devNum = dNum % devices.length;
      const modem = this.modems[devices[devNum]];
      if (!modem) {
        if (this.tryCount > 0) {
          this.tryCount--;
          dNum++;
          return getDevices(dNum);
        }
        return null;
      }
      return modem;
    };
    const { message, devices, phones } = args;
    let num = 0;
    for await (const phone of phones) {
      const modem = getDevices(num);
      if (!modem) {
        event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT, {
          phone,
          leftErr: true,
        });
        return;
      }
      await modem.sms_mode(0);
      const pduList = PDU.generateSubmit(phone, message);
      let ok = true;
      for (const pdu of pduList) {
        const msgResult = await modem.sms_send_pdu(pdu);
        ok = msgResult.includes('OK') && ok;
        // console.log({ msgResult, ok });
      }

      event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT, {
        phone,
        status: ok,
        finish: num === phones.length - 1,
      });
      num++;

      await delay(3000);
    }
  };

  _handleOnStop = (event: Electron.IpcMainEvent, args: any) => {
    console.log({ type: 'main _handleOnStop', args });
  };
}

export default SerialReceiver;
