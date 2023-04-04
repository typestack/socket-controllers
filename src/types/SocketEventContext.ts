import { SocketEventType } from './enums/SocketEventType';
import { Server, Socket } from 'socket.io';

export interface SocketEventContext {
  socketIo: Server;
  socket: Socket;
  eventType: SocketEventType;
  eventName?: string;
  messageArgs?: any[];
  nspParams?: Record<string, string>;
  ack?: Function | null;
}
