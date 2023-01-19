import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';

export const getMetadata = <T extends Object, U>(target: T): U => {
  return (Reflect as any).getMetadata(SOCKET_CONTROLLER_META_KEY, target);
};
