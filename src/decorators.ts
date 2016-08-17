import {defaultMetadataArgsStorage} from "./index";
import {SocketControllerMetadataArgs} from "./metadata/args/SocketControllerMetadataArgs";
import {ActionMetadataArgs} from "./metadata/args/ActionMetadataArgs";
import {ActionTypes} from "./metadata/types/ActionTypes";
import {ParamMetadataArgs} from "./metadata/args/ParamMetadataArgs";
import {ParamTypes} from "./metadata/types/ParamTypes";
import {ClassTransformOptions} from "class-transformer";
import {MiddlewareMetadataArgs} from "./metadata/args/MiddlewareMetadataArgs";
import {MiddlewareInterface} from "./MiddlewareInterface";
import {ResultMetadataArgs} from "./metadata/args/ResultMetadataArgs";
import {ResultTypes} from "./metadata/types/ResultTypes";

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
export function ConnectedSocket() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.CONNECTED_SOCKET,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

/**
 * Injects message body.
 */
export function MessageBody(options?: { classTransformOptions?: ClassTransformOptions }) {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_BODY,
            reflectedType: format,
            classTransformOptions: options && options.classTransformOptions ? options.classTransformOptions : undefined
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

/**
 * Injects query parameter from the socket.
 */
export function SocketQueryParam(name?: string) {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_QUERY_PARAM,
            reflectedType: format,
            value: name
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

export function SocketIO() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_IO,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

export function SocketId() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_ID,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

export function SocketRequest() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_REQUEST,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

export function SocketRooms() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.SOCKET_ROOMS,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}

export function Middleware(options?: { priority?: number }): Function {
    return function (object: Function) {
        const metadata: MiddlewareMetadataArgs = {
            target: object,
            priority: options && options.priority ? options.priority : undefined
        };
        defaultMetadataArgsStorage().middlewares.push(metadata);
    };
}

/**
 */
export function EmitOnSuccess(messageName?: string, options?: { classTransformOptions?: ClassTransformOptions }): Function {
    return function (object: Object, methodName: string) {
        const metadata: ResultMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ResultTypes.EMIT_ON_SUCCESS,
            value: messageName,
            classTransformOptions: options && options.classTransformOptions ? options.classTransformOptions : undefined
        };
        defaultMetadataArgsStorage().results.push(metadata);
    };
}

/**
 */
export function EmitOnFail(messageName?: string, options?: { classTransformOptions?: ClassTransformOptions }): Function {
    return function (object: Object, methodName: string) {
        const metadata: ResultMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ResultTypes.EMIT_ON_FAIL,
            value: messageName,
            classTransformOptions: options && options.classTransformOptions ? options.classTransformOptions : undefined
        };
        defaultMetadataArgsStorage().results.push(metadata);
    };
}

/**
 */
export function SkipEmitOnEmptyResult(): Function {
    return function (object: Object, methodName: string) {
        const metadata: ResultMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ResultTypes.SKIP_EMIT_ON_EMPTY_RESULT
        };
        defaultMetadataArgsStorage().results.push(metadata);
    };
}