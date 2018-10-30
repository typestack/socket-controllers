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
    if (options && options.controllers && options.controllers.length)
        importClassesFromDirectories(options.controllers);

    if (options && options.middlewares && options.middlewares.length)
        importClassesFromDirectories(options.middlewares);

    if (options.useClassTransformer !== undefined) {
        executor.useClassTransformer = options.useClassTransformer;
    } else {
        executor.useClassTransformer = true;
    }

    executor.classToPlainTransformOptions = options.classToPlainTransformOptions;
    executor.plainToClassTransformOptions = options.plainToClassTransformOptions;

    // run socket controller register and other operations
    executor.execute();
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
export * from "./decorators";
export * from "./SocketControllersOptions";
export * from "./MiddlewareInterface";
