import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { ControllerMetadata } from '../types/ControllerMetadata';
import { getMetadata } from './get-metadata';

export const addControllerMetadata = (target: Function, metadata: Pick<ControllerMetadata, 'namespace' | 'type'>) => {
  const existingMetadata = getMetadata<any, ControllerMetadata>(target);
  (Reflect as any).defineMetadata(
    SOCKET_CONTROLLER_META_KEY,
    {
      ...existingMetadata,
      ...metadata,
    },
    target
  );
};
