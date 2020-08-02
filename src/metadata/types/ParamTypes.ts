/**
 * Controller action's parameter type.
 */
export type ParamType =
  | 'custom'
  | 'connected-socket'
  | 'socket-body'
  | 'socket-query-param'
  | 'socket-io'
  | 'socket-id'
  | 'socket-request'
  | 'socket-rooms'
  | 'namespace-params'
  | 'namespace-param';

/**
 * Controller action's parameter type.
 */
export class ParamTypes {
  static CUSTOM: ParamType = 'custom';
  static CONNECTED_SOCKET: ParamType = 'connected-socket';
  static SOCKET_BODY: ParamType = 'socket-body';
  static SOCKET_QUERY_PARAM: ParamType = 'socket-query-param';
  static SOCKET_IO: ParamType = 'socket-io';
  static SOCKET_ID: ParamType = 'socket-id';
  static SOCKET_REQUEST: ParamType = 'socket-request';
  static SOCKET_ROOMS: ParamType = 'socket-rooms';
  static NAMESPACE_PARAMS: ParamType = 'namespace-params';
  static NAMESPACE_PARAM: ParamType = 'namespace-param';
}
