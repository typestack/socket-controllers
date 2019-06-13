import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";
import {ParamTypes} from "../metadata/types/ParamTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Injects query parameter from the received socket request.
 */
export function SocketQueryParam(name?: string): Function {
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