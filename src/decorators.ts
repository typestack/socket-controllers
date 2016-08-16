import {defaultMetadataArgsStorage} from "./index";
import {SocketControllerMetadataArgs} from "./metadata/args/SocketControllerMetadataArgs";
import {ActionMetadataArgs} from "./metadata/args/ActionMetadataArgs";
import {ActionTypes} from "./metadata/types/ActionTypes";
import {ParamMetadataArgs} from "./metadata/args/ParamMetadataArgs";
import {ParamTypes} from "./metadata/types/ParamTypes";

/**
 * Registers a class to be a socket controller that can listen to events and respond to them.
 *
 * @param namespace Namespace in which this controller's events will be registered.
 */
export function SocketController(namespace?: string) {
    return function (object: Function) {
        const metadata: SocketControllerMetadataArgs = {
            namespace: namespace,
            target: object
        };
        defaultMetadataArgsStorage().controllers.push(metadata);
    };
}

/**
 * Registers controller's function to be executed when socket receives given message.
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

/**
 * Registers controller's function to be executed when client connects to the socket.
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

/**
 * Registers controller's function to be executed when client disconnects from the socket.
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

/**
 * Injects connected client's socket object to the action handler function.
 */
export function SocketClient() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_CLIENT,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

/**
 * Injects message body.
 */
export function SocketBody() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_BODY,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}