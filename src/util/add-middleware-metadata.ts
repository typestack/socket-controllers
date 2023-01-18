import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { MiddlewareMetadata } from '../types/MiddlewareMetadata';

export const addMiddlewareMetadata = (target: Function, metadata: MiddlewareMetadata) => {
  (Reflect as any).defineMetadata(SOCKET_CONTROLLER_META_KEY, metadata, target);
};
