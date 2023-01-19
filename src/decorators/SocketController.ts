import { HandlerType } from '../types/enums/HandlerType';
import { addControllerMetadata } from '../util/add-controller-metadata';

export function SocketController(namespace?: string | RegExp) {
  return function (object: Function) {
    addControllerMetadata(object, { namespace, type: HandlerType.CONTROLLER });
  };
}
