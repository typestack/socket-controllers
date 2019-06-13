import {ResultMetadataArgs} from "../metadata/args/ResultMetadataArgs";
import {ResultTypes} from "../metadata/types/ResultTypes";
import {defaultMetadataArgsStorage} from "../index";

/**
 * Used in conjunction with @EmitOnSuccess and @EmitOnFail decorators.
 * If result returned by controller action is null or undefined then messages will not be emitted by @EmitOnSuccess
 * or @EmitOnFail decorators.
 */
export function SkipEmitOnEmptyResult(): Function {
    return function (object: Object, methodName: string) {
        const metadata: ResultMetadataArgs = {
            target: object.constructor,
            method: methodName,
            type: ResultTypes.SKIP_EMIT_ON_EMPTY_RESULT
        };
        defaultMetadataArgsStorage().results.push(metadata);
    };
}