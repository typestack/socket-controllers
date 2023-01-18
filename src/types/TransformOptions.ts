import { ClassTransformOptions } from 'class-transformer';

export interface TransformOptions {
  transform?: boolean;
  parameterTransformOptions?: ClassTransformOptions;
  resultTransformOptions?: ClassTransformOptions;
}
