import {ActionMetadataArgs} from "../metadata/args/ActionMetadataArgs";
import {ActionTypes} from "../metadata/types/ActionTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Registers controller's action to be executed when client connects to the socket.
 */
export function OnConnect(): Function {
    return function (object: Object, methodName: string) {
        const metadata: ActionMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ActionTypes.CONNECT
        };
        defaultMetadataArgsStorage().actions.push(metadata);
    };
}