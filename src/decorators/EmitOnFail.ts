import { addResultToActionMetadata } from '../util/add-result-to-action-metadata';
import { ResultType } from '../types/enums/ResultType';
import { ActionTransformOptions } from '../types/ActionTransformOptions';

export function EmitOnFail(messageName: string, options?: ActionTransformOptions): Function {
  return function (object: Object, methodName: string) {
    addResultToActionMetadata(object.constructor, methodName, {
      type: ResultType.EMIT_ON_FAIL,
      options: {
        messageName,
        ...options,
      },
    });
  };
}
