
/**
 * Special function used to get currently authorized user.
 */
export type CurrentUserChecker = (socket: any) => Promise<any>|any;
