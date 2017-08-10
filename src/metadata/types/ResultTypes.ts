/**
 * Action result handler type.
 */
export type ResultType = "emit_on_success"|"emit_on_fail"|"emit_on_error"|"skip_emit_on_empty_result";

/**
 * Static access to result handler types.
 */
export class ResultTypes {
    static EMIT_ON_SUCCESS: ResultType = "emit_on_success";
    static EMIT_ON_FAIL: ResultType = "emit_on_fail";
    static EMIT_ON_ERROR: ResultType = "emit_on_error";
    static SKIP_EMIT_ON_EMPTY_RESULT: ResultType = "skip_emit_on_empty_result";
}