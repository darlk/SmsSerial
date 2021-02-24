import SerialPortGSM from './serialport-gsm';
const options = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false,
  autoDeleteOnReceive: true,
  enableConcatenation: true,
  incomingCallIndication: true,
  incomingSMSIndication: true,
  pin: '',
  customInitCommand: '',
  logger: console,
};

export function initModem(path) {
  return new Promise((res, rej) => {
    const modem = SerialPortGSM.Modem();
    modem.open(path, options, (err, msg) => {
      if (err) {
        rej({ err });
        return;
      }
      modem.initializeModem(
        (msg2, err2) => {
          if (err2) {
            rej({ err2 });
            return;
          }
          modem.setModemMode((msg1, err1) => {
            if (err1) {
              rej({ err1 });
              return;
            }
            res(modem);
          }, 'PDU');
        },
        false,
        500
      );
    });
  });
}

export function delay(timeout) {
  return new Promise((res) =>
    setTimeout(() => {
      res();
    }, timeout)
  );
}
