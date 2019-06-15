import {Socket} from "socket.io";

/**
 * Special function used to get currently authorized user.
 */
export type CurrentUserChecker = (socket: Socket) => Promise<any>|any;
