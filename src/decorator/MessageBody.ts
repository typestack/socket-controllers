import {ClassTransformOptions} from "class-transformer";
import {ParamMetadataArgs} from "../metadata/args/ParamMetadataArgs";
import {ParamTypes} from "../metadata/types/ParamTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Injects received message body.
 */
export function MessageBody(options?: {classTransformOptions?: ClassTransformOptions}): Function {
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