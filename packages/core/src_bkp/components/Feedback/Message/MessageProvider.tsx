import React, { createContext, useContext } from 'react';
import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

interface MessageProviderProps {
  children: React.ReactNode;
}

const MessageContext = createContext<MessageInstance | null>(null);

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { message } = App.useApp();

  return (
    <MessageContext.Provider value={message}>
      {children}
    </MessageContext.Provider>
  );
};

MessageProvider.displayName = 'MessageProvider';

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return context;
};
