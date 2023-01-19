import { HandlerType } from './enums/HandlerType';

export interface MiddlewareMetadata {
  namespace?: string | RegExp | Array<RegExp | string>;
  priority?: number;
  type: HandlerType.MIDDLEWARE;
}
