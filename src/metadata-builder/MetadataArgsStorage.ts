import {SocketControllerMetadataArgs} from "../metadata/args/SocketControllerMetadataArgs";
import {ActionMetadataArgs} from "../metadata/args/ActionMetadataArgs";
import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";

/**
 * Storage all metadatas read from decorators.
 */
export class MetadataArgsStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    controllers: SocketControllerMetadataArgs[] = [];
    actions: ActionMetadataArgs[] = [];
    params: ParamMetadataArgs[] = [];

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    findControllerMetadatasForClasses(classes: Function[]): SocketControllerMetadataArgs[] {
        return this.controllers.filter(ctrl => {
            return classes.filter(cls => ctrl.target === cls).length > 0;
        });
    }

    findActionsWithTarget(target: Function): ActionMetadataArgs[] {
        return this.actions.filter(action => action.target === target);
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
        this.actions = [];
        this.params = [];
    }

}