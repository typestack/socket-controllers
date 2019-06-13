import {MiddlewareMetadataArgs} from "../metadata/args/MiddlewareMetadataArgs";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Registers a new middleware to be registered in the socket.io.
 */
export function Middleware(options?: {priority?: number}): Function {
    return function (object: Function) {
        const metadata: MiddlewareMetadataArgs = {
            target: object,
            priority: options && options.priority ? options.priority : undefined
        };
        defaultMetadataArgsStorage().middlewares.push(metadata);
    };
}