import { ipcMain } from 'electron';
import { IPCSignals } from '../utils/constants';
import SerialPortGSM from '../utils/serialport-gsm';
// import SerialPort from 'serialport';
// import PDU from 'node-sms-pdu';

import { initModem, sandMsg, delay } from '../utils/utils';

const venderList = ['1a86', '2c7c', '04e2'];

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

  _log(event: Electron.IpcMainEvent, msg: any) {
    event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_ERROR_MSG, msg);
  }

  _handleOnRefresh = async (event: Electron.IpcMainEvent, args: any) => {
    // console.log('main _handleOnRefresh');
    try {
      if (this.modems) {
        Object.values(this.modems).forEach((port: any) => {
          port.close((err: any) => {
            this._log(event, { err });
          });
        });
      }
    } catch (error) {
      this._log(event, error);
    }

    //
    const ports: any = await SerialPortGSM.list();
    this.modems = {};
    this.tryCount = 0;
    const deviceOpts = [];

    this._log(event, { ports });

    for await (const port of ports) {
      const venderId = port.vendorId?.toLocaleLowerCase() || '';
      if (venderId && venderList.includes(venderId)) {
        try {
          const modemObj: any = await initModem(port.path);
          if (modemObj) {
            this.modems[port.path] = modemObj;
            this.tryCount++;
            deviceOpts.push({
              value: port.path,
              label: port.path.substring(port.path.lastIndexOf('/') + 1),
            });
          }
        } catch (error) {
          this._log(event, { error });
        }
      }
    }

    console.log(this.modems);

    event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_REFRESH, {
      deviceOpts,
    });
  };

  _handleOnSendMessage = async (event: Electron.IpcMainEvent, args: any) => {
    // console.log({ type: 'main _handleOnSendMessage', args });
    const { message, devices, phones } = args;

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
    for (let num = 0; num < phones.length; num++) {
      const phone = phones[num];
      const tarPath = devices[num % devices.length];
      this._log(event, { tarPath, phone });
      const modem = this.modems[tarPath];
      if (!modem) {
        event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT, {
          phone,
          leftErr: true,
        });
        return;
      }
      const result: any = await sandMsg(phone, message, modem);
      this._log(event, result);

      event.sender.send(IPCSignals.RENDER_MSG_RECEIVER_SEND_RESULT, {
        phone,
        status: result.status === 'success' ? 1 : 2,
        finish: num === phones.length - 1,
      });

      await delay(3000);
    }
  };

  _handleOnStop = (event: Electron.IpcMainEvent, args: any) => {
    console.log({ type: 'main _handleOnStop', args });
  };
}

export default SerialReceiver;
