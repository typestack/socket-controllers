import { addActionToControllerMetadata } from '../util/add-action-to-controller-metadata';
import { ActionType } from '../types/enums/ActionType';

export function OnConnect(): Function {
  return function (object: Object, methodName: string) {
    addActionToControllerMetadata(object.constructor, {
      methodName,
      type: ActionType.CONNECT,
      options: {},
    });
  };
}
