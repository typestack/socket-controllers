import { SocketEventContext } from './SocketEventContext';

export interface InterceptorInterface {
  use(context: SocketEventContext, next: () => any): any;
}
