import { ResultType } from './enums/ResultType';
import { ActionTransformOptions } from './ActionTransformOptions';

export interface ResultMetadata {
  type: ResultType;
  options: ActionTransformOptions & Record<string, unknown>;
}
