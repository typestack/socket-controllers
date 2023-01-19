import { HandlerType } from '../types/enums/HandlerType';
import { addMiddlewareMetadata } from '../util/add-middleware-metadata';

export function Middleware(options?: {
  priority?: number;
  namespace?: string | RegExp | Array<RegExp | string>;
}): Function {
  return function (object: Function) {
    addMiddlewareMetadata(object, {
      type: HandlerType.MIDDLEWARE,
      namespace: options?.namespace,
      priority: options?.priority,
    });
  };
}
