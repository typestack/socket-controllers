/**
 * Controller action's parameter type.
 */
export type ParamType = "custom"|"connected_socket"|"socket_body"|"socket_query_param"|"socket_io"|"socket_id"
    |"socket_request"|"socket_rooms";

/**
 * Controller action's parameter type.
 */
export class ParamTypes {
    static CUSTOM: ParamType = "custom";
    static CONNECTED_SOCKET: ParamType = "connected_socket";
    static SOCKET_BODY: ParamType = "socket_body";
    static SOCKET_QUERY_PARAM: ParamType = "socket_query_param";
    static SOCKET_IO = "socket_io";
    static SOCKET_ID = "socket_id";
    static SOCKET_REQUEST = "socket_request";
    static SOCKET_ROOMS = "socket_rooms";
}