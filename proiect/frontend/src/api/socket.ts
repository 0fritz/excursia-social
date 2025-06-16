import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { Message } from '@/api/chatsApi';

const token = localStorage.getItem('token') || '';

const socket: typeof Socket = io('http://localhost:4000', {
  auth: { token },
  autoConnect: false, // delay connection until explicitly call connect
});

export const joinChat = (chatId: number) => {
  socket.emit('joinChat', chatId);
};

export const leaveChat = (chatId: number) => {
  socket.emit('leaveChat', chatId);
};

export const sendMessage = (chatId: number, content: string) => {
  socket.emit('sendMessage', { chatId, content });
};

export const onNewMessage = (handler: (message: Message) => void) => {
  socket.on('newMessage', handler);
};

export const disconnect = () => {
  socket.disconnect();
};

export const connect = () => {
    if (!socket.connected) {
      (socket as any).auth = { token: localStorage.getItem('token') };
      socket.connect();
    }
  };
  

export default socket;
