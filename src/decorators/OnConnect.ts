import { addActionToControllerMetadata } from '../util/add-action-to-controller-metadata';
import { SocketEventType } from '../types/enums/SocketEventType';

export function OnConnect(): Function {
  return function (object: Object, methodName: string) {
    addActionToControllerMetadata(object.constructor, {
      methodName,
      type: SocketEventType.CONNECT,
      options: {},
    });
  };
}
