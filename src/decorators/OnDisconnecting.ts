import { addActionToControllerMetadata } from '../util/add-action-to-controller-metadata';
import { SocketEventType } from '../types/enums/SocketEventType';

export function OnDisconnecting(): Function {
  return function (object: Object, methodName: string) {
    addActionToControllerMetadata(object.constructor, {
      methodName,
      type: SocketEventType.DISCONNECTING,
      options: {},
    });
  };
}
