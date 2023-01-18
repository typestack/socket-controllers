import { addParameterToActionMetadata } from '../util/add-parameter-to-action-metadata';
import { ParameterType } from '../types/enums/ParameterType';

export function SocketQueryParam(name?: string) {
  return function (object: Object, methodName: string, index: number) {
    const format = (Reflect as any).getMetadata('design:paramtypes', object, methodName)[index];

    addParameterToActionMetadata(object.constructor, methodName, {
      index,
      reflectedType: format,
      type: ParameterType.SOCKET_QUERY_PARAM,
      options: { name, transform: false },
    });
  };
}
