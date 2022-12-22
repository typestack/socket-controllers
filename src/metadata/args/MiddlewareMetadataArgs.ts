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
  namespace?: string | RegExp | Array<RegExp | string>;
}
