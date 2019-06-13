import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";
import {ParamTypes} from "../metadata/types/ParamTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Injects parameters of the connected socket namespace.
 */
export function NspParams() {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.NAMESPACE_PARAMS,
            reflectedType: format
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}