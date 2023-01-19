import { Socket } from 'socket.io-client';
import { Server } from 'socket.io';

export const waitForEvent = (socket: Socket | Server, event: string): Promise<unknown> => {
  return new Promise(resolve => {
    socket.on(event, data => {
      resolve(data);
    });
  });
};
