import { addActionToControllerMetadata } from '../util/add-action-to-controller-metadata';
import { SocketEventType } from '../types/enums/SocketEventType';

export function OnMessage(name?: string): Function {
  return function (object: Object, methodName: string) {
    addActionToControllerMetadata(object.constructor, {
      methodName,
      type: SocketEventType.MESSAGE,
      options: { name },
    });
  };
}
