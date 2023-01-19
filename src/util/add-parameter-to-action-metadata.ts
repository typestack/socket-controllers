import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { ParameterMetadata } from '../types/ParameterMetadata';
import { getMetadata } from './get-metadata';
import { ControllerMetadata } from '../types/ControllerMetadata';

export const addParameterToActionMetadata = (target: Function, methodName: string, args: ParameterMetadata) => {
  const existingMetadata = getMetadata<any, ControllerMetadata>(target);
  (Reflect as any).defineMetadata(
    SOCKET_CONTROLLER_META_KEY,
    {
      ...existingMetadata,
      actions: {
        ...existingMetadata?.actions,
        [methodName]: {
          ...existingMetadata?.actions?.[methodName],
          parameters: [args, ...(existingMetadata?.actions?.[methodName]?.parameters || [])],
        },
      },
    },
    target
  );
};
