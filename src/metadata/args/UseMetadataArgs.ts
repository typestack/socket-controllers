/**
 * Metadata used to store registered middlewares.
 */
export interface UseMetadataArgs {

    /**
     * Object class of this "use".
     */
    target: Function;

    /**
     * Middleware to be executed for this "use".
     */
    middleware: Function;

}