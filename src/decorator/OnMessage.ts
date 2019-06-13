import {ActionMetadataArgs} from "../metadata/args/ActionMetadataArgs";
import {ActionTypes} from "../metadata/types/ActionTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Registers controller's action to be executed when socket receives message with given name.
 */
export function OnMessage(name?: string): Function {
    return function (object: Object, methodName: string) {
        const metadata: ActionMetadataArgs = {
            name: name,
            target: object.constructor,
            method: methodName,
            type: ActionTypes.MESSAGE
        };
        defaultMetadataArgsStorage().actions.push(metadata);
    };
}