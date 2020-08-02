import { ParamTypes } from '../types/ParamTypes';
import { ClassTransformOptions } from 'class-transformer';

/**
 * Controller metadata used to storage information about registered parameters.
 */
export interface ParamMetadataArgs {
  /**
   * Parameter target.
   */
  target: any;

  /**
   * Method on which's parameter is attached.
   */
  method: string;

  /**
   * Index (# number) of the parameter in the method signature.
   */
  index: number;

  /**
   * Parameter type.
   */
  type: ParamTypes;

  /**
   * Reflected type of the parameter.
   */
  reflectedType: any;

  /**
   * Transforms the value.
   */
  transform?: (value: any, socket: any) => Promise<any> | any;

  /**
   * Class transform options used to perform plainToClass operation.
   */
  classTransformOptions?: ClassTransformOptions;

  /**
   * Extra parameter value.
   */
  value?: any;
}
