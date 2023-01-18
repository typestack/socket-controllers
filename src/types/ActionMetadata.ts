import { ParameterMetadata } from './ParameterMetadata';
import { ResultMetadata } from './ResultMetadata';
import { ActionType } from './enums/ActionType';

export interface ActionMetadata {
  type: ActionType;
  methodName: string;
  options: any;
  parameters: ParameterMetadata[];
  results: ResultMetadata[];
}
