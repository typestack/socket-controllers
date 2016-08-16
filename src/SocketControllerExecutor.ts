import {MetadataBuilder} from "./metadata-builder/MetadataBuilder";
import {ActionMetadata} from "./metadata/ActionMetadata";
import {ClassTransformOptions, plainToClass} from "class-transformer";
import {ActionTypes} from "./metadata/types/ActionTypes";
import {ParamMetadata} from "./metadata/ParamMetadata";
import {ParameterParseJsonError} from "./error/ParameterParseJsonError";

/**
 * Registers controllers and actions in the given server framework.
 */
export class SocketControllerExecutor {

    // -------------------------------------------------------------------------
    // Public properties
    // -------------------------------------------------------------------------

    /**
     * Indicates if class-transformer package should be used to perform message body serialization / deserialization.
     * By default its enabled.
     */
    useClassTransformer: boolean;

    /**
     * Global class transformer options passed to class-transformer during classToPlain operation.
     * This operation is being executed when server returns response to user.
     */
    classToPlainTransformOptions: ClassTransformOptions;

    /**
     * Global class transformer options passed to class-transformer during plainToClass operation.
     * This operation is being executed when parsing user parameters.
     */
    plainToClassTransformOptions: ClassTransformOptions;

    // -------------------------------------------------------------------------
    // Private properties
    // -------------------------------------------------------------------------

    private metadataBuilder: MetadataBuilder;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private io: any) {
        this.metadataBuilder = new MetadataBuilder();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    execute() {
        this.registerActions();
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    /**
     * Registers actions in the driver.
     */
    private registerActions(classes?: Function[]): this {
        const controllers = this.metadataBuilder.buildControllerMetadata(classes);
        this.io.on("connection", (clientSocket: any) => {
            controllers.forEach(controller => {
                controller.actions.forEach(action => {
                    if (action.type === ActionTypes.CONNECT) {
                        this.handleAction(action, { socket: clientSocket });

                    } else if (action.type === ActionTypes.DISCONNECT) {
                        clientSocket.on("disconnect", () => this.handleAction(action, { socket: clientSocket }));

                    } else if (action.type === ActionTypes.MESSAGE) {
                        clientSocket.on(action.name, (data: any) => this.handleAction(action, { socket: clientSocket, data: data }));
                    }
                });
            });
        });

        return this;
    }

    private handleAction(action: ActionMetadata, actionOptions: { socket?: any, data?: any }) {
        
        // compute all parameters
        const paramsPromises = action.params
            .sort((param1, param2) => param1.index - param2.index)
            .map(param => this.handleParam(param, actionOptions));

        // after all parameters are computed
        Promise.all(paramsPromises).then(params => {
            action.executeAction(params);
        }).catch(error => {
            console.log("Error during computation params of the socket controller: ", error);
            throw error;
        });
    }

    private handleParam(param: ParamMetadata, options: { socket?: any, data?: any }) {
        let value = options.data;
        if (!value === null || value === undefined || value === "")
            value = this.handleParamFormat(value, param);

        // if transform function is given for this param then apply it
        if (param.transform)
            value = param.transform(value, options.socket);

        return value;
    }

    private handleParamFormat(value: any, param: ParamMetadata): any {
        const format = param.reflectedType;
        const formatName = format instanceof Function && format.name ? format.name : format instanceof String ? format : "";
        switch (formatName.toLowerCase()) {
            case "number":
                return +value;

            case "string":
                return value;

            case "boolean":
                if (value === "true") {
                    return true;

                } else if (value === "false") {
                    return false;
                }
                return !!value;

            default:
                const isObjectFormat = format instanceof Function || formatName.toLowerCase() === "object";
                if (value && isObjectFormat)
                    value = this.parseParamValue(value, param);
        }
        return value;
    }

    private parseParamValue(value: any, paramMetadata: ParamMetadata) {
        try {
            const parseValue = typeof value === "string" ? JSON.parse(value) : value;
            if (paramMetadata.reflectedType !== Object && paramMetadata.reflectedType && this.useClassTransformer) {
                const options = paramMetadata.classTransformOptions || this.plainToClassTransformOptions;
                return plainToClass(paramMetadata.reflectedType, parseValue, options);
            } else {
                return parseValue;
            }
        } catch (er) {
            throw new ParameterParseJsonError(value);
        }
    }

}