import { ActionMetadata } from './ActionMetadata';
import { ResultType } from './types/ResultTypes';
import { ResultMetadataArgs } from './args/ResultMetadataArgs';
import { ClassTransformOptions } from 'class-transformer';

export class ResultMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   */
  actionMetadata: ActionMetadata;

  /**
   */
  target: Function;

  /**
   */
  method: string;

  /**
   */
  type: ResultType;

  /**
   */
  value: any;

  classTransformOptions: ClassTransformOptions;

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  constructor(action: ActionMetadata, args: ResultMetadataArgs) {
    this.actionMetadata = action;
    this.target = args.target;
    this.method = args.method;
    this.type = args.type;
    this.value = args.value;
    this.classTransformOptions = args.classTransformOptions;
  }
}
