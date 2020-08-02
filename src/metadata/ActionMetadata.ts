import { ParamMetadata } from './ParamMetadata';
import { ActionMetadataArgs } from './args/ActionMetadataArgs';
import { ActionType } from './types/ActionTypes';
import { ControllerMetadata } from './ControllerMetadata';
import { ResultMetadata } from './ResultMetadata';
import { ResultTypes } from './types/ResultTypes';

export class ActionMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Action's controller.
   */
  controllerMetadata: ControllerMetadata;

  /**
   * Action's parameters.
   */
  params: ParamMetadata[];

  /**
   * Action's result handlers.
   */
  results: ResultMetadata[];

  /**
   * Message name served by this action.
   */
  name: string;

  /**
   * Class on which's method this action is attached.
   */
  target: Function;

  /**
   * Object's method that will be executed on this action.
   */
  method: string;

  /**
   * Action type represents http method used for the registered route. Can be one of the value defined in ActionTypes
   * class.
   */
  type: ActionType;

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  constructor(controllerMetadata: ControllerMetadata, args: ActionMetadataArgs) {
    this.controllerMetadata = controllerMetadata;
    this.name = args.name;
    this.target = args.target;
    this.method = args.method;
    this.type = args.type;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  executeAction(params: any[]) {
    // TODO: remove fix this eslint warning
    // eslint-disable-next-line prefer-spread
    return this.controllerMetadata.instance[this.method].apply(this.controllerMetadata.instance, params);
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  get emitOnSuccess() {
    return this.results.find(resultHandler => resultHandler.type === ResultTypes.EMIT_ON_SUCCESS);
  }

  get emitOnFail() {
    return this.results.find(resultHandler => resultHandler.type === ResultTypes.EMIT_ON_FAIL);
  }

  get skipEmitOnEmptyResult() {
    return this.results.find(resultHandler => resultHandler.type === ResultTypes.SKIP_EMIT_ON_EMPTY_RESULT);
  }
}
