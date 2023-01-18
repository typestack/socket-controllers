import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { ResultMetadata } from '../types/ResultMetadata';
import { getMetadata } from './get-metadata';
import { ControllerMetadata } from '../types/ControllerMetadata';

export const addResultToActionMetadata = (target: Function, methodName: string, args: ResultMetadata) => {
  const existingMetadata = getMetadata<any, ControllerMetadata>(target);
  (Reflect as any).defineMetadata(
    SOCKET_CONTROLLER_META_KEY,
    {
      ...existingMetadata,
      actions: {
        ...existingMetadata?.actions,
        [methodName]: {
          ...existingMetadata?.actions?.[methodName],
          results: [args, ...(existingMetadata?.actions?.[methodName]?.results || [])],
        },
      },
    },
    target
  );
};
