import { MetadataBuilder } from './metadata-builder/MetadataBuilder';
import { ActionMetadata } from './metadata/ActionMetadata';
import { instanceToPlain, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { ActionTypes } from './metadata/types/ActionTypes';
import { ParamMetadata } from './metadata/ParamMetadata';
import { ParameterParseJsonError } from './error/ParameterParseJsonError';
import { ParamTypes } from './metadata/types/ParamTypes';
import { ControllerMetadata } from './metadata/ControllerMetadata';
import { pathToRegexp } from 'path-to-regexp';
import { Namespace } from 'socket.io';
import { MiddlewareMetadata } from './metadata/MiddlewareMetadata';

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
  useClassTransformer?: boolean;

  /**
   * Global class transformer options passed to class-transformer during classToPlain operation.
   * This operation is being executed when server returns response to user.
   */
  classToPlainTransformOptions?: ClassTransformOptions;

  /**
   * Global class transformer options passed to class-transformer during plainToInstance operation.
   * This operation is being executed when parsing user parameters.
   */
  plainToClassTransformOptions?: ClassTransformOptions;

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

  execute(controllerClasses?: Function[], middlewareClasses?: Function[]) {
    this.registerControllers(controllerClasses);
    this.registerMiddlewares(middlewareClasses);
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  /**
   * Registers middlewares.
   */
  private registerMiddlewares(classes?: Function[]): this {
    const middlewares = this.metadataBuilder.buildMiddlewareMetadata(classes);
    middlewares.sort((middleware1, middleware2) => (middleware1.priority || 0) - (middleware2.priority || 0));

    const middlewaresWithoutNamespace = middlewares.filter(middleware => !middleware.namespace);
    const middlewaresWithNamespace = middlewares.filter(middleware => !!middleware.namespace);

    for (const middleware of middlewaresWithoutNamespace) {
      this.registerMiddleware(this.io as Namespace, middleware);
    }

    this.io.on('new_namespace', (namespace: Namespace) => {
      for (const middleware of middlewaresWithNamespace) {
        const middlewareNamespaces = Array.isArray(middleware.namespace)
          ? middleware.namespace
          : [middleware.namespace];

        const shouldApply = middlewareNamespaces.some(nsp => {
          const nspRegexp = nsp instanceof RegExp ? nsp : pathToRegexp(nsp as string);
          return nspRegexp.test(namespace.name);
        });

        if (shouldApply) {
          this.registerMiddleware(namespace, middleware);
        }
      }
    });

    return this;
  }

  /**
   * Registers middleware.
   */
  private registerMiddleware(namespace: Namespace, middleware: MiddlewareMetadata) {
    namespace.use((socket: any, next: (err?: any) => any) => {
      middleware.instance.use(socket, next);
    });
  }

  /**
   * Registers controllers.
   */
  private registerControllers(classes?: Function[]): this {
    const controllers = this.metadataBuilder.buildControllerMetadata(classes);
    const controllersWithoutNamespaces = controllers.filter(ctrl => !ctrl.namespace);
    const controllersWithNamespaces = controllers.filter(ctrl => !!ctrl.namespace);

    // register controllers without namespaces
    this.io.on('connection', (socket: any) => this.handleConnection(controllersWithoutNamespaces, socket));

    // register controllers with namespaces
    controllersWithNamespaces.forEach(controller => {
      let namespace: string | RegExp | undefined = controller.namespace;
      if (namespace && !(namespace instanceof RegExp)) {
        namespace = pathToRegexp(namespace);
      }
      this.io.of(namespace).on('connection', (socket: any) => this.handleConnection([controller], socket));
    });

    return this;
  }

  private handleConnection(controllers: ControllerMetadata[], socket: any) {
    controllers.forEach(controller => {
      (controller.actions || []).forEach(action => {
        if (action.type === ActionTypes.CONNECT) {
          this.handleAction(action, { socket: socket })
            .then(result => this.handleSuccessResult(result, action, socket))
            .catch(error => this.handleFailResult(error, action, socket));
        } else if (action.type === ActionTypes.DISCONNECT) {
          socket.on('disconnect', () => {
            this.handleAction(action, { socket: socket })
              .then(result => this.handleSuccessResult(result, action, socket))
              .catch(error => this.handleFailResult(error, action, socket));
          });
        } else if (action.type === ActionTypes.MESSAGE) {
          socket.on(action.name, (data: any) => {
            // todo get multiple args
            this.handleAction(action, { socket: socket, data: data })
              .then(result => this.handleSuccessResult(result, action, socket))
              .catch(error => this.handleFailResult(error, action, socket));
          });
        }
      });
    });
  }

  private handleAction(action: ActionMetadata, options: { socket?: any; data?: any }): Promise<any> {
    // compute all parameters
    const paramsPromises = (action.params || [])
      .sort((param1, param2) => param1.index - param2.index)
      .map(param => {
        if (param.type === ParamTypes.CONNECTED_SOCKET) {
          return options.socket;
        } else if (param.type === ParamTypes.SOCKET_IO) {
          return this.io;
        } else if (param.type === ParamTypes.SOCKET_QUERY_PARAM) {
          return options.socket.handshake.query[param.value];
        } else if (param.type === ParamTypes.SOCKET_ID) {
          return options.socket.id;
        } else if (param.type === ParamTypes.SOCKET_REQUEST) {
          return options.socket.request;
        } else if (param.type === ParamTypes.SOCKET_ROOMS) {
          return options.socket.rooms;
        } else if (param.type === ParamTypes.NAMESPACE_PARAMS) {
          return this.handleNamespaceParams(options.socket, action, param);
        } else if (param.type === ParamTypes.NAMESPACE_PARAM) {
          const params: any[] = this.handleNamespaceParams(options.socket, action, param);
          return params[param.value];
        } else {
          return this.handleParam(param, options);
        }
      });

    // after all parameters are computed
    const paramsPromise = Promise.all(paramsPromises).catch(error => {
      console.log('Error during computation params of the socket controller: ', error);
      throw error;
    });
    return paramsPromise.then(params => {
      return action.executeAction(params);
    });
  }

  private handleParam(param: ParamMetadata, options: { socket?: any; data?: any }) {
    let value = options.data;
    if (value !== null && value !== undefined && value !== '') value = this.handleParamFormat(value, param);

    // if transform function is given for this param then apply it
    if (param.transform) value = param.transform(value, options.socket);

    return value;
  }

  private handleParamFormat(value: any, param: ParamMetadata): any {
    const format = param.reflectedType;
    const formatName = format instanceof Function && format.name ? format.name : format instanceof String ? format : '';
    switch (formatName.toLowerCase()) {
      case 'number':
        return +value;

      case 'string':
        return value;

      case 'boolean':
        if (value === 'true') {
          return true;
        } else if (value === 'false') {
          return false;
        }
        return !!value;

      default:
        const isObjectFormat = format instanceof Function || formatName.toLowerCase() === 'object';
        if (value && isObjectFormat) value = this.parseParamValue(value, param);
    }
    return value;
  }

  private parseParamValue(value: any, paramMetadata: ParamMetadata) {
    try {
      const parseValue = typeof value === 'string' ? JSON.parse(value) : value;
      if (paramMetadata.reflectedType !== Object && paramMetadata.reflectedType && this.useClassTransformer) {
        const options = paramMetadata.classTransformOptions || this.plainToClassTransformOptions;
        return plainToInstance(paramMetadata.reflectedType as never, parseValue as never, options);
      } else {
        return parseValue;
      }
    } catch (er) {
      throw new ParameterParseJsonError(value);
    }
  }

  private handleSuccessResult(result: any, action: ActionMetadata, socket: any) {
    if (result !== null && result !== undefined && action.emitOnSuccess) {
      const transformOptions = action.emitOnSuccess.classTransformOptions || this.classToPlainTransformOptions;
      const transformedResult =
        this.useClassTransformer && result instanceof Object ? instanceToPlain(result, transformOptions) : result;
      socket.emit(action.emitOnSuccess.value, transformedResult);
    } else if ((result === null || result === undefined) && action.emitOnSuccess && !action.skipEmitOnEmptyResult) {
      socket.emit(action.emitOnSuccess.value);
    }
  }

  private handleFailResult(result: any, action: ActionMetadata, socket: any) {
    if (result !== null && result !== undefined && action.emitOnFail) {
      const transformOptions = action.emitOnSuccess?.classTransformOptions || this.classToPlainTransformOptions;
      let transformedResult =
        this.useClassTransformer && result instanceof Object ? instanceToPlain(result, transformOptions) : result;
      if (result instanceof Error && !Object.keys(transformedResult as never).length) {
        transformedResult = result.toString();
      }
      socket.emit(action.emitOnFail.value, transformedResult);
    } else if ((result === null || result === undefined) && action.emitOnFail && !action.skipEmitOnEmptyResult) {
      socket.emit(action.emitOnFail.value);
    }
  }

  private handleNamespaceParams(socket: any, action: ActionMetadata, param: ParamMetadata): any[] {
    const keys: any[] = [];
    const regexp = pathToRegexp(action.controllerMetadata.namespace || '/', keys);
    const parts: any[] = regexp.exec(socket.nsp.name as string) || [];
    const params: any[] = [];
    keys.forEach((key: any, index: number) => {
      params[key.name] = this.handleParamFormat(parts[index + 1], param);
    });
    return params;
  }
}
