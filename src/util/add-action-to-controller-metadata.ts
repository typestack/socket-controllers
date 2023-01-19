import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { ActionMetadata } from '../types/ActionMetadata';
import { getMetadata } from './get-metadata';
import { ControllerMetadata } from '../types/ControllerMetadata';

export const addActionToControllerMetadata = (
  target: Function,
  actionMetadata: Pick<ActionMetadata, 'type' | 'methodName' | 'options'>
) => {
  const existingMetadata = getMetadata<any, ControllerMetadata>(target);
  (Reflect as any).defineMetadata(
    SOCKET_CONTROLLER_META_KEY,
    {
      ...existingMetadata,
      actions: {
        ...existingMetadata?.actions,
        [actionMetadata.methodName]: {
          ...existingMetadata?.actions?.[actionMetadata.methodName],
          ...actionMetadata,
        },
      },
    },
    target
  );
};
