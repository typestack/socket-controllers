import { ParameterType } from './enums/ParameterType';
import { ActionTransformOptions } from './ActionTransformOptions';

export interface ParameterMetadata {
  type: ParameterType;
  index: number;
  reflectedType: any;
  options: ActionTransformOptions & Record<string, unknown>;
}
