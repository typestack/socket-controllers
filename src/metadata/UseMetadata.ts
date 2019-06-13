import {UseMetadataArgs} from "./args/UseMetadataArgs";
import {MiddlewareInterface} from "../MiddlewareInterface";
import {getFromContainer} from "../container";

/**
 * "Use middleware" metadata.
 */
export class UseMetadata {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    /**
     * Object class of the middleware class.
     */
    target: Function;

    /**
     * Middleware to be executed by this "use".
     */
    middleware: Function;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(args: UseMetadataArgs) {
        this.target = args.target;
        this.middleware = args.middleware;
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    get instance(): MiddlewareInterface {
        return getFromContainer<MiddlewareInterface>(this.middleware);
    }

}