import { ParameterMetadata } from './ParameterMetadata';
import { ResultMetadata } from './ResultMetadata';
import { SocketEventType } from './enums/SocketEventType';

export interface ActionMetadata {
  type: SocketEventType;
  methodName: string;
  options: any;
  parameters: ParameterMetadata[];
  results: ResultMetadata[];
}
