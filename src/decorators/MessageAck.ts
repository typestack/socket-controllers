import { addParameterToActionMetadata } from '../util/add-parameter-to-action-metadata';
import { ParameterType } from '../types/enums/ParameterType';

export function MessageAck() {
  return function (object: Object, methodName: string, index: number) {
    const format = (Reflect as any).getMetadata('design:paramtypes', object, methodName)[index];
    addParameterToActionMetadata(object.constructor, methodName, {
      index,
      reflectedType: format,
      type: ParameterType.MESSAGE_ACK,
      options: {},
    });
  };
}
