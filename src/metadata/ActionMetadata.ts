import {ParamMetadata} from "./ParamMetadata";
import {ActionMetadataArgs} from "./args/ActionMetadataArgs";
import {ActionType} from "./types/ActionTypes";
import {ControllerMetadata} from "./ControllerMetadata";

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
        return this.controllerMetadata.instance[this.method].apply(this.controllerMetadata.instance, params);
    }

}