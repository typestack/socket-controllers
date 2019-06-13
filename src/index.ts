import {MetadataArgsStorage} from "./metadata-builder/MetadataArgsStorage";
import {importClassesFromDirectories} from "./util/DirectoryExportedClassesLoader";
import {SocketControllerExecutor} from "./SocketControllerExecutor";
import {SocketControllersOptions} from "./SocketControllersOptions";

// -------------------------------------------------------------------------
// Main Functions
// -------------------------------------------------------------------------

/**
 * Registers all loaded actions in your express application.
 */
export function useSocketServer<T>(io: T, options?: SocketControllersOptions): T {
    createExecutor(io, options || {});
    return io;
}

/**
 * Registers all loaded actions in your express application.
 */
export function createSocketServer(port: number, options?: SocketControllersOptions): any {
    const io = require("socket.io")(port);
    createExecutor(io, options || {});
    return io;
}

/**
 * Registers all loaded actions in your express application.
 */
function createExecutor(io: any, options: SocketControllersOptions): void {
    const executor = new SocketControllerExecutor(io);

    // second import all controllers and middlewares and error handlers
    let controllerClasses: Function[];
    if (options && options.controllers && options.controllers.length)
        controllerClasses = (options.controllers as any[]).filter(controller => controller instanceof Function);
    const controllerDirs = (options.controllers as any[]).filter(controller => typeof controller === "string");
    controllerClasses.push(...importClassesFromDirectories(controllerDirs));

    let middlewareClasses: Function[];
    if (options && options.middlewares && options.middlewares.length) {
        middlewareClasses = (options.middlewares as any[]).filter(controller => controller instanceof Function);
        const middlewareDirs = (options.middlewares as any[]).filter(controller => typeof controller === "string");
        middlewareClasses.push(...importClassesFromDirectories(middlewareDirs));
    }

    if (options.useClassTransformer !== undefined) {
        executor.useClassTransformer = options.useClassTransformer;
    } else {
        executor.useClassTransformer = true;
    }

    executor.classToPlainTransformOptions = options.classToPlainTransformOptions;
    executor.plainToClassTransformOptions = options.plainToClassTransformOptions;

    // run socket controller register and other operations
    executor.execute(controllerClasses, middlewareClasses);
}

// -------------------------------------------------------------------------
// Global Metadata Storage
// -------------------------------------------------------------------------

/**
 * Gets the metadata arguments storage.
 */
export function defaultMetadataArgsStorage(): MetadataArgsStorage {
    if (!(global as any).socketControllersMetadataArgsStorage)
        (global as any).socketControllersMetadataArgsStorage = new MetadataArgsStorage();

    return (global as any).socketControllersMetadataArgsStorage;
}

// -------------------------------------------------------------------------
// Commonly Used exports
// -------------------------------------------------------------------------

export * from "./container";
export * from "./SocketControllersOptions";
export * from "./MiddlewareInterface";

// decorators
export * from "./decorator/SocketController";
export * from "./decorator/SocketIO";
export * from "./decorator/SocketId";
export * from "./decorator/SocketRequest";
export * from "./decorator/SocketRooms";
export * from "./decorator/SocketQueryParam";
export * from "./decorator/ConnectedSocket";
export * from "./decorator/OnConnect";
export * from "./decorator/OnDisconnect";
export * from "./decorator/OnMessage";
export * from "./decorator/EmitOnSuccess";
export * from "./decorator/EmitOnFail";
export * from "./decorator/SkipEmitOnEmptyResult";
export * from "./decorator/Middleware";
export * from "./decorator/MessageBody";
export * from "./decorator/NspParams";
export * from "./decorator/NspParam";