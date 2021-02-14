export type ContainerPropsType = {};

export type ContainerStateType = {
  devices: string[];
  phoneList: Array<PhoneOptionType>;
  deviceOpts: Array<PortOptionType>;
  message: string;
  working: boolean;
};

export type ContainerEventType = {
  onDevicesRefresh: () => void;
  onDevicesChange: (devices: any) => void;
  onPhoneChange: (phoneList: Array<PhoneOptionType>) => void;
  onMessageChange: (msg: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMessageSend: () => void;
};

export type PortOptionType = {
  label: string;
  value: string;
};

export type PhoneOptionType = {
  id: string;
  phone: string;
  status: number;
};
