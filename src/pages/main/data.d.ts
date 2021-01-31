export type ContainerPropsType = {};

export type ContainerStateType = {
  devices: string[];
  phoneList: string[];
  deviceOpts: Array<string>;
  message: string;
};

export type ContainerEventType = {
  onDevicesRefresh: () => void;
  onDevicesChange: (devices: any) => void;
  onPhoneChange: (phoneList: string[]) => void;
  onMessageChange: (msg: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMessageSend: () => void;
};
