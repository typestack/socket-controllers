import {ClassTransformOptions} from "class-transformer";
import {ResultMetadataArgs} from "../metadata/args/ResultMetadataArgs";
import {ResultTypes} from "../metadata/types/ResultTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * If this decorator is set then after controller action will emit message with the given name after action execution.
 * It will emit message only if controller succeed without errors.
 * If result is a Promise then it will wait until promise is resolved and emit a message.
 */
export function EmitOnSuccess(messageName: string, options?: {classTransformOptions?: ClassTransformOptions}): Function {
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