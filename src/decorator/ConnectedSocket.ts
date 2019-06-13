import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";
import {ParamTypes} from "../metadata/types/ParamTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Injects connected client's socket object to the controller action.
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