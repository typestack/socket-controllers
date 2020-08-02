import { SocketControllerMetadataArgs } from '../metadata/args/SocketControllerMetadataArgs';
import { ActionMetadataArgs } from '../metadata/args/ActionMetadataArgs';
import { ParamMetadataArgs } from '../metadata/args/ParamMetadataArgs';
import { MiddlewareMetadataArgs } from '../metadata/args/MiddlewareMetadataArgs';
import { ResultMetadataArgs } from '../metadata/args/ResultMetadataArgs';

/**
 * Storage all metadatas read from decorators.
 */
export class MetadataArgsStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  controllers: SocketControllerMetadataArgs[] = [];
  middlewares: MiddlewareMetadataArgs[] = [];
  actions: ActionMetadataArgs[] = [];
  results: ResultMetadataArgs[] = [];
  params: ParamMetadataArgs[] = [];

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  findControllerMetadatasForClasses(classes: Function[]): SocketControllerMetadataArgs[] {
    return this.controllers.filter(ctrl => {
      return classes.filter(cls => ctrl.target === cls).length > 0;
    });
  }

  findMiddlewareMetadatasForClasses(classes: Function[]): MiddlewareMetadataArgs[] {
    return this.middlewares.filter(middleware => {
      return classes.filter(cls => middleware.target === cls).length > 0;
    });
  }

  findActionsWithTarget(target: Function): ActionMetadataArgs[] {
    return this.actions.filter(action => action.target === target);
  }

  findResutlsWithTargetAndMethod(target: Function, methodName: string): ResultMetadataArgs[] {
    return this.results.filter(result => {
      return result.target === target && result.method === methodName;
    });
  }

  findParamsWithTargetAndMethod(target: Function, methodName: string): ParamMetadataArgs[] {
    return this.params.filter(param => {
      return param.target === target && param.method === methodName;
    });
  }

  /**
   * Removes all saved metadata.
   */
  reset() {
    this.controllers = [];
    this.middlewares = [];
    this.actions = [];
    this.params = [];
  }
}
