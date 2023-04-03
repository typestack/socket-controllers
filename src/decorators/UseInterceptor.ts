import { addInterceptorToActionMetadata } from '../util/add-interceptor-to-action-metadata';
import { getMetadata } from '../util/get-metadata';
import { ControllerMetadata } from '../types/ControllerMetadata';

export function UseInterceptor(...interceptors: any[]): Function {
  return function (object: Function | Object, methodName?: string) {
    for (const interceptor of interceptors) {
      if (object instanceof Function) {
        // Class interceptor
        const existingMetadata: ControllerMetadata = getMetadata(object);
        for (const key of Object.keys(existingMetadata?.actions || {})) {
          addInterceptorToActionMetadata(object, key, interceptor as Function);
        }
      } else {
        // Method interceptor
        addInterceptorToActionMetadata(object.constructor, methodName as string, interceptor as Function);
      }
    }
  };
}
