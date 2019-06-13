import {ActionMetadataArgs} from "../metadata/args/ActionMetadataArgs";
import {ActionTypes} from "../metadata/types/ActionTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Registers controller's action to be executed when client disconnects from the socket.
 */
export function OnDisconnect(): Function {
    return function (object: Object, methodName: string) {
        const metadata: ActionMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ActionTypes.DISCONNECT
        };
        defaultMetadataArgsStorage().actions.push(metadata);
    };
}