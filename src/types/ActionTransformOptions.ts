import { ClassTransformOptions } from 'class-transformer';

export interface ActionTransformOptions {
  transform?: boolean;
  transformOptions?: ClassTransformOptions;
}
