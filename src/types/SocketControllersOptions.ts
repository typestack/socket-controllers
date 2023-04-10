import { Server } from 'socket.io';
import { TransformOptions } from './TransformOptions';
import { SocketEventContext } from './SocketEventContext';

export interface SocketControllersOptions {
  container: { get<T>(someClass: { new (...args: any[]): T } | Function): T };

  scopedContainerGetter?: (context: SocketEventContext) => {
    get<T>(someClass: { new (...args: any[]): T } | Function): T;
  };

  scopedContainerDisposer?: (container: { get<T>(someClass: { new (...args: any[]): T } | Function): T }) => void;

  io?: Server;

  port?: number;

  controllers?: Function[] | string[];

  middlewares?: Function[] | string[];

  transformOption?: Partial<TransformOptions>;
}
