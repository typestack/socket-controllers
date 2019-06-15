import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";
import {ParamTypes} from "../metadata/types/ParamTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Injects named param from the connected socket namespace.
 */
export function CurrentUser(): Function {
    return function (object: Object, methodName: string, index: number) {
        let format = (Reflect as any).getMetadata("design:paramtypes", object, methodName)[index];
        const metadata: ParamMetadataArgs = {
            target: object.constructor,
            method: methodName,
            index: index,
            type: ParamTypes.CURRENT_USER,
            reflectedType: format,
        };
        defaultMetadataArgsStorage().params.push(metadata);
    };
}
