import {defaultMetadataArgsStorage} from "../index";

/**
 * Specifies a given middleware to be used for controller.
 * Must be set to controller class.
 */
export function UseMiddleware(...middlewares: Array<Function>): Function;

/**
 * Specifies a given middleware to be used for controller.
 * Must be set to controller class.
 */
export function UseMiddleware(...middlewares: Array<(pocket: any, next: ((err?: any) => any)) => any>): Function;

/**
 * Specifies a given middleware to be used for controller.
 * Must be set to controller class.
 */
export function UseMiddleware(...middlewares: Array<Function|((pocket: any, next: ((err?: any) => any)) => any)>): Function {
    return function (object: Function) {
        middlewares.forEach(middleware => {
            defaultMetadataArgsStorage().uses.push({
                target: object,
                middleware: middleware,
            });
        });
    };
}
