/**
 * Controller action's parameter type.
 */
export type ParamType = "custom"
    | "connected-socket"
    | "socket-body"
    | "socket-query-param"
    | "socket-io"
    | "socket-id"
    | "socket-request"
    | "socket-rooms";

/**
 * Controller action's parameter type.
 */
export class ParamTypes {
    static CUSTOM: ParamType = "custom";
    static CONNECTED_SOCKET: ParamType = "connected-socket";
    static SOCKET_BODY: ParamType = "socket-body";
    static SOCKET_QUERY_PARAM: ParamType = "socket-query-param";
    static SOCKET_IO = "socket-io";
    static SOCKET_ID = "socket-id";
    static SOCKET_REQUEST = "socket-request";
    static SOCKET_ROOMS = "socket-rooms";
}