import { ClassTransformOptions } from 'class-transformer';

/**
 * Socket controllers initialization options.
 */
export interface SocketControllersOptions {
  /**
   * List of directories from where to "require" all your controllers.
   */
  controllers?: Function[] | string[];

  /**
   * List of directories from where to "require" all your middlewares.
   */
  middlewares?: Function[] | string[];

  /**
   * Indicates if class-transformer package should be used to perform message body serialization / deserialization.
   * By default its enabled.
   */
  useClassTransformer?: boolean;

  /**
   * Global class transformer options passed to class-transformer during classToPlain operation.
   * This operation is being executed when server returns response to user.
   */
  classToPlainTransformOptions?: ClassTransformOptions;

  /**
   * Global class transformer options passed to class-transformer during plainToClass operation.
   * This operation is being executed when parsing user parameters.
   */
  plainToClassTransformOptions?: ClassTransformOptions;
}
