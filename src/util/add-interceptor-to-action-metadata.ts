import { SOCKET_CONTROLLER_META_KEY } from '../types/SocketControllerMetaKey';
import { getMetadata } from './get-metadata';
import { ControllerMetadata } from '../types/ControllerMetadata';

export const addInterceptorToActionMetadata = (target: Function, methodName: string, interceptor: Function) => {
  const existingMetadata = getMetadata<any, ControllerMetadata>(target);
  (Reflect as any).defineMetadata(
    SOCKET_CONTROLLER_META_KEY,
    {
      ...existingMetadata,
      actions: {
        ...existingMetadata?.actions,
        [methodName]: {
          ...existingMetadata?.actions?.[methodName],
          interceptors: [interceptor, ...(existingMetadata?.actions?.[methodName]?.interceptors || [])],
        },
      },
    },
    target
  );
};
