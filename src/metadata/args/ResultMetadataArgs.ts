import { ResultType } from '../types/ResultTypes';
import { ClassTransformOptions } from 'class-transformer';

/**
 */
export interface ResultMetadataArgs {
  /**
   */
  value?: string;

  /**
   */
  target: Function;

  /**
   */
  method: string;

  /**
   * Result handler type.
   */
  type: ResultType;

  classTransformOptions?: ClassTransformOptions;
}
