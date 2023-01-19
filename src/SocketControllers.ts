import { Namespace, Server, Socket } from 'socket.io';
import { sync } from 'glob';
import { normalize } from 'path';
import { SOCKET_CONTROLLER_META_KEY } from './types/SocketControllerMetaKey';
import { pathToRegexp } from 'path-to-regexp';
import { HandlerMetadata } from './types/HandlerMetadata';
import { HandlerType } from './types/enums/HandlerType';
import { SocketControllersOptions } from './types/SocketControllersOptions';
import { ControllerMetadata } from './types/ControllerMetadata';
import { MiddlewareMetadata } from './types/MiddlewareMetadata';
import { ActionType } from './types/enums/ActionType';
import { ActionMetadata } from './types/ActionMetadata';
import { ParameterMetadata } from './types/ParameterMetadata';
import { ParameterType } from './types/enums/ParameterType';
import { ResultType } from './types/enums/ResultType';
import { getMetadata } from './util/get-metadata';
import { TransformOptions } from './types/TransformOptions';
import { defaultTransformOptions } from './types/constants/defaultTransformOptions';
import { ActionTransformOptions } from './types/ActionTransformOptions';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { MiddlewareInterface } from './types/MiddlewareInterface';

export class SocketControllers {
  public container: { get<T>(someClass: { new (...args: any[]): T } | Function): T };
  public controllers: HandlerMetadata<any, ControllerMetadata>[];
  public middlewares: HandlerMetadata<MiddlewareInterface, MiddlewareMetadata>[];
  public io: Server;
  public transformOptions: TransformOptions;

  constructor(private options: SocketControllersOptions) {
    this.container = options.container;
    this.io = options.io || new Server(options.port);
    this.transformOptions = {
      ...defaultTransformOptions,
      ...options.transformOption,
    };
    this.controllers = this.loadHandlers<Function, ControllerMetadata>(
      options.controllers || [],
      HandlerType.CONTROLLER
    );
    this.middlewares = this.loadHandlers<MiddlewareInterface, MiddlewareMetadata>(
      options.middlewares || [],
      HandlerType.MIDDLEWARE
    );

    this.registerMiddlewares();
    this.registerControllers();
  }

  private loadHandlers<T extends Object, U>(
    handlers: Array<Function | string>,
    type: HandlerType
  ): HandlerMetadata<T, U>[] {
    const loadedHandlers: Function[] = [];

    for (const handler of handlers) {
      if (typeof handler === 'string') {
        loadedHandlers.push(...this.loadHandlersFromPath(handler, type));
      } else {
        loadedHandlers.push(handler);
      }
    }

    return loadedHandlers.map(handler => {
      return {
        metadata: getMetadata(handler),
        instance: this.container.get(handler),
      };
    });
  }

  private loadHandlersFromPath(path: string, handlerType: HandlerType): Function[] {
    const files = sync(normalize(path).replace(/\\/g, '/'));

    return files
      .map(file => require(file))
      .reduce((loadedFiles: Function[], loadedFile: Record<string, any>) => {
        const handlersInFile = Object.values(loadedFile).filter(fileEntry => {
          if (typeof fileEntry !== 'function') {
            return false;
          }

          if (!(Reflect as any).hasMetadata(SOCKET_CONTROLLER_META_KEY, fileEntry as Function)) {
            return false;
          }

          return (Reflect as any).getMetadata(SOCKET_CONTROLLER_META_KEY, fileEntry as Function).type === handlerType;
        });
        loadedFiles.push(...(handlersInFile as Function[]));

        return loadedFiles;
      }, []);
  }

  private registerMiddlewares() {
    const middlewares = this.middlewares.slice().sort((middleware1, middleware2) => {
      return (middleware1.metadata.priority || 0) - (middleware2.metadata.priority || 0);
    });

    const middlewaresWithoutNamespace = middlewares.filter(middleware => !middleware.metadata.namespace);
    const middlewaresWithNamespace = middlewares.filter(middleware => !!middleware.metadata.namespace);

    for (const middleware of middlewaresWithoutNamespace) {
      this.registerMiddleware(this.io as unknown as Namespace, middleware.instance);
    }

    this.io.on('new_namespace', (namespace: Namespace) => {
      for (const middleware of middlewaresWithNamespace) {
        const middlewareNamespaces = Array.isArray(middleware.metadata.namespace)
          ? middleware.metadata.namespace
          : [middleware.metadata.namespace];

        const shouldApply = middlewareNamespaces.some(nsp => {
          const nspRegexp = nsp instanceof RegExp ? nsp : pathToRegexp(nsp as string);
          return nspRegexp.test(namespace.name);
        });

        if (shouldApply) {
          this.registerMiddleware(namespace, middleware.instance);
        }
      }
    });
  }

  private registerControllers() {
    const controllersWithoutNamespace = this.controllers.filter(controller => !controller.metadata.namespace);
    const controllersWithNamespace = this.controllers.filter(controller => !!controller.metadata.namespace);

    this.io.on('connection', (socket: Socket) => {
      for (const controller of controllersWithoutNamespace) {
        this.registerController(socket, controller);
      }
    });

    for (const controller of controllersWithNamespace) {
      this.io.of(pathToRegexp(controller.metadata.namespace as string)).on('connection', (socket: Socket) => {
        this.registerController(socket, controller);
      });
    }
  }

  private registerController(socket: Socket, controller: HandlerMetadata<any, ControllerMetadata>) {
    const connectedAction = Object.values(controller.metadata.actions || {}).find(
      action => action.type === ActionType.CONNECT
    );
    const disconnectedAction = Object.values(controller.metadata.actions || {}).find(
      action => action.type === ActionType.DISCONNECT
    );
    const messageActions = Object.values(controller.metadata.actions || {}).filter(
      action => action.type === ActionType.MESSAGE
    );

    if (connectedAction) {
      this.executeAction(socket, controller, connectedAction);
    }

    if (disconnectedAction) {
      socket.on('disconnect', () => {
        this.executeAction(socket, controller, disconnectedAction);
      });
    }

    for (const messageAction of messageActions) {
      socket.on(messageAction.options.name, (message: any) => {
        this.executeAction(socket, controller, messageAction, message);
      });
    }
  }

  private executeAction(
    socket: Socket,
    controller: HandlerMetadata<any, ControllerMetadata>,
    action: ActionMetadata,
    data?: any
  ) {
    const parameters = this.resolveParameters(socket, controller.metadata, action.parameters || [], data);
    try {
      const actionResult = controller.instance[action.methodName](...parameters);
      Promise.resolve(actionResult)
        .then(result => {
          this.handleActionResult(socket, action, result, ResultType.EMIT_ON_SUCCESS);
        })
        .catch(error => {
          this.handleActionResult(socket, action, error, ResultType.EMIT_ON_FAIL);
        });
    } catch (error: any) {
      this.handleActionResult(socket, action, error, ResultType.EMIT_ON_FAIL);
    }
  }

  private handleActionResult(socket: Socket, action: ActionMetadata, result: any, resultType: ResultType) {
    const onResultActions = action.results?.filter(result => result.type === resultType) || [];
    const skipOnEmpty = action.results?.some(result => result.type === ResultType.SKIP_EMIT_ON_EMPTY_RESULT);

    if (result == null && skipOnEmpty) {
      return;
    }

    for (const onResultAction of onResultActions) {
      const transformedValue =
        result instanceof Error
          ? result.message
          : this.transformActionValue(result as never, null, onResultAction.options, 'result');
      socket.emit(onResultAction.options.messageName as never, transformedValue);
    }
  }

  private registerMiddleware(namespace: Namespace, middleware: MiddlewareInterface) {
    namespace.use((socket: Socket, next: (err?: any) => void) => {
      middleware.use(socket, next);
    });
  }

  private resolveParameters(
    socket: Socket,
    controllerMetadata: ControllerMetadata,
    parameterMetadatas: ParameterMetadata[],
    data: any
  ) {
    const parameters = [];

    for (const metadata of parameterMetadatas) {
      const parameterValue = this.resolveParameter(socket, controllerMetadata, metadata, data) as never;
      parameters[metadata.index] = this.transformActionValue(
        parameterValue,
        metadata.reflectedType as never,
        metadata.options,
        'parameter'
      );
    }

    return parameters;
  }

  private resolveParameter(socket: Socket, controller: ControllerMetadata, parameter: ParameterMetadata, data: any) {
    switch (parameter.type) {
      case ParameterType.CONNECTED_SOCKET:
        return socket;
      case ParameterType.SOCKET_ID:
        return socket.id;
      case ParameterType.SOCKET_IO:
        return this.io;
      case ParameterType.SOCKET_ROOMS:
        return socket.rooms;
      case ParameterType.MESSAGE_BODY:
        return data;
      case ParameterType.SOCKET_QUERY_PARAM:
        return socket.handshake.query[parameter.options.name as string];
      case ParameterType.SOCKET_REQUEST:
        return socket.request;
      case ParameterType.NAMESPACE_PARAMS:
        return this.extractNamespaceParameters(socket, controller.namespace, parameter);
      case ParameterType.NAMESPACE_PARAM:
        return this.extractNamespaceParameters(socket, controller.namespace, parameter)?.[
          parameter.options.name as string
        ];
    }
  }

  private transformActionValue(
    value: never,
    reflectedType: unknown,
    options: ActionTransformOptions,
    transformType: 'parameter' | 'result'
  ) {
    const transformOptions: TransformOptions = {
      transform: options.transform ?? this.transformOptions.transform,
      parameterTransformOptions: options.transformOptions ?? this.transformOptions.parameterTransformOptions,
      resultTransformOptions: options.transformOptions ?? this.transformOptions.resultTransformOptions,
    };

    if (!transformOptions.transform) {
      return value;
    }

    if (typeof value !== 'object' || Array.isArray(value) || value == null) {
      return value;
    }

    if (transformType === 'parameter') {
      return plainToInstance(reflectedType as never, value, transformOptions.parameterTransformOptions);
    }

    if (transformType === 'result') {
      return instanceToPlain(value, transformOptions.resultTransformOptions);
    }

    return value;
  }

  private extractNamespaceParameters(
    socket: Socket,
    namespace: string | RegExp | undefined,
    parameterMetadata: ParameterMetadata
  ) {
    const keys: any[] = [];
    const regexp = namespace instanceof RegExp ? namespace : pathToRegexp(namespace || '/', keys);
    const parts: any[] = regexp.exec(socket.nsp.name) || [];
    const params: Record<string, string> = {};
    keys.forEach((key: any, index: number) => {
      params[key.name as string] = parameterMetadata?.options?.transform
        ? this.transformActionValue(
            parts[index + 1] as never,
            parameterMetadata.reflectedType,
            parameterMetadata.options,
            'parameter'
          )
        : parts[index + 1];
    });
    return params;
  }
}