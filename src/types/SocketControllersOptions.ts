import { Server } from 'socket.io';
import { TransformOptions } from './TransformOptions';

export interface SocketControllersOptions {
  container: { get<T>(someClass: { new (...args: any[]): T } | Function): T };

  io?: Server;

  port?: number;

  controllers?: Function[] | string[];

  middlewares?: Function[] | string[];

  transformOption?: Partial<TransformOptions>;
}
