export interface MiddlewareMetadataArgs {
  /**
   * Indicates object which is used by this controller.
   */
  target: Function;

  /**
   * Middleware priority.
   */
  priority?: number;

  /**
   * Limits usage of the middleware to the given namespaces
   */
  nsp: RegExp | string[];
}
