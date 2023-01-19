import { addResultToActionMetadata } from '../util/add-result-to-action-metadata';
import { ResultType } from '../types/enums/ResultType';

export function SkipEmitOnEmptyResult(): Function {
  return function (object: Object, methodName: string) {
    addResultToActionMetadata(object.constructor, methodName, {
      type: ResultType.SKIP_EMIT_ON_EMPTY_RESULT,
      options: {},
    });
  };
}
