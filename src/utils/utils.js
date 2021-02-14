import Modem from './modem';

export function initModem(path) {
  return new Promise((res, rej) => {
    const modem = new Modem(path, {
      retry: 1000,
      baudRate: 115200,
    });
    modem.open((err) => {
      if (err) {
        rej(err);
        return;
      }
      res(modem);
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
