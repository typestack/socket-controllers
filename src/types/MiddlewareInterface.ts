import { Socket } from 'socket.io';

export interface MiddlewareInterface {
  use(socket: Socket, next: (err?: any) => any): any;
}
