import {SocketControllerMetadataArgs} from "../metadata/args/SocketControllerMetadataArgs";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Registers a class to be a socket controller that can listen to websocket events and respond to them.
 *
 * @param namespace Namespace in which this controller's events will be registered.
 */
export function SocketController(namespace?: string | RegExp): Function {
    return function (object: Function) {
        const metadata: SocketControllerMetadataArgs = {
            namespace: namespace,
            target: object
        };
        defaultMetadataArgsStorage().controllers.push(metadata);
    };
}