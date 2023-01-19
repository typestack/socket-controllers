import { HandlerType } from './enums/HandlerType';
import { ActionMetadata } from './ActionMetadata';

export interface ControllerMetadata {
  namespace?: string | RegExp;
  type: HandlerType.CONTROLLER;
  actions: {
    [methodName: string]: ActionMetadata;
  };
}
