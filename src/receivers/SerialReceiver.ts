import { ipcMain, ipcRenderer } from 'electron';
import { IPCSignals } from '../utils/constants';
import SerialPort from 'serialport';
import PDU from 'node-sms-pdu';

import { initModem, delay } from '../utils/utils';

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
    const ports = await SerialPort.list();
    this.modems = {};
    this.tryCount = 0;
    let deviceOpts = [];

    this._log(event, { ports });

    for await (const port of ports) {
      const venderId = port.vendorId?.toLocaleLowerCase() || '';
      if (venderId && venderList.includes(venderId)) {
        try {
          let modemObj: any = await initModem(port.path);
          const ccidTest: any = await modemObj.exec('CCID');
          if (ccidTest.includes('ERROR')) {
            this._log(event, { ccidTest });
            continue;
          }
          const cregTest: any = await modemObj.test('CREG');
          if (!cregTest.includes('OK')) {
            this._log(event, { cregTest });
            continue;
          }

          // const singleTest: any = await modemObj.test('CSQ');
          // if (
          //   singleTest.includes('ERROR') ||
          //   singleTest.split(' ')[1].split(',')[1] !== '1'
          // ) {
          // this._log(event, { singleTest });
          //   continue;
          // }

          this._log(event, {
            ccidTest,
            cregTest,
            // singleTest,
          });

          this.modems[port.path] = modemObj;
          this.tryCount++;
          deviceOpts.push({
            value: port.path,
            label: port.path.substring(port.path.lastIndexOf('/') + 1),
          });
        } catch (error) {
          this._log(event, { error });
        }
      }
    }

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
    let num = 0;
    for await (const phone of phones) {
      // const modem = getDevices(num);
      const modem = this.modems[devices[num % devices.length]];
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
      for await (const pdu of pduList) {
        const msgResult = await modem.sms_send_pdu(pdu);
        ok = msgResult.includes('OK') && ok;
        // console.log({ msgResult, ok });
        this._log(event, { msgResult, pdu });
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
