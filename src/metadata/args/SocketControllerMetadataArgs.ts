/**
 * Controller metadata used to storage information about registered controller.
 */
export interface SocketControllerMetadataArgs {

    /**
     * Indicates object which is used by this controller.
     */
    target: Function;

    /**
     * Extra namespace in which this controller's events will be registered.
     */
    namespace?: string | RegExp | ((name: string, query: any, next: (err: any, valid: boolean) => void) => void);
    
}