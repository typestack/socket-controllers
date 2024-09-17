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
import { SocketEventType } from './types/enums/SocketEventType';
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
import { InterceptorInterface } from './types/InterceptorInterface';
import { chainExecute } from './util/chain-execute';
import { SocketEventContext } from './types/SocketEventContext';

export class SocketControllers {
  public container: { get<T>(someClass: { new (...args: any[]): T } | Function): T };
  public controllers: HandlerMetadata<ControllerMetadata>[];
  public middlewares: HandlerMetadata<MiddlewareMetadata>[];
  public io: Server;
  public transformOptions: TransformOptions;

  constructor(private options: SocketControllersOptions) {
    this.container = options.container;
    this.io = options.io || new Server(options.port);
    this.transformOptions = {
      ...defaultTransformOptions,
      ...options.transformOption,
    };
    this.controllers = this.loadHandlers<ControllerMetadata>(options.controllers || [], HandlerType.CONTROLLER);
    this.middlewares = this.loadHandlers<MiddlewareMetadata>(options.middlewares || [], HandlerType.MIDDLEWARE);

    this.registerMiddlewares();
    this.registerControllers();
  }

  private loadHandlers<T extends Object>(handlers: Array<Function | string>, type: HandlerType): HandlerMetadata<T>[] {
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
        target: handler,
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

    for (const middleware of middlewaresWithoutNamespace) {
      this.registerMiddleware(this.io as unknown as Namespace, middleware);
    }

    this.io.on('new_namespace', (namespace: Namespace) => {
      for (const middleware of middlewares) {
        const middlewareNamespaces = Array.isArray(middleware.metadata.namespace)
          ? middleware.metadata.namespace
          : [middleware.metadata.namespace];

        const shouldApply = middlewareNamespaces.some(nsp => {
          // Register middlewares without namespace too
          if (nsp == null) {
            return true;
          }

          const nspRegexp = nsp instanceof RegExp ? nsp : pathToRegexp(nsp).regexp;
          return nspRegexp.test(namespace.name);
        });

        if (shouldApply) {
          this.registerMiddleware(namespace, middleware);
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

    const controllerNamespaceMap: Record<string, HandlerMetadata<ControllerMetadata>[]> = {};
    const controllerNamespaceRegExpMap: Record<string, string | RegExp> = {};

    for (const controller of controllersWithNamespace) {
      const nsp = controller.metadata.namespace as string;
      if (!controllerNamespaceMap[nsp]) {
        controllerNamespaceMap[nsp] = [];
      }
      controllerNamespaceMap[nsp].push(controller);
      controllerNamespaceRegExpMap[nsp] = nsp;
    }

    for (const [nsp, controllers] of Object.entries(controllerNamespaceMap)) {
      const namespace = controllerNamespaceRegExpMap[nsp];
      this.io
        .of(namespace instanceof RegExp ? namespace : pathToRegexp(namespace).regexp)
        .on('connection', (socket: Socket) => {
          for (const controller of controllers) {
            this.registerController(socket, controller);
          }
        });
    }
  }

  private registerController(socket: Socket, controller: HandlerMetadata<ControllerMetadata>) {
    const connectedAction = Object.values(controller.metadata.actions || {}).find(
      action => action.type === SocketEventType.CONNECT
    );
    const disconnectedAction = Object.values(controller.metadata.actions || {}).find(
      action => action.type === SocketEventType.DISCONNECT
    );
    const disconnectingAction = Object.values(controller.metadata.actions || {}).find(
      action => action.type === SocketEventType.DISCONNECTING
    );
    const messageActions = Object.values(controller.metadata.actions || {}).filter(
      action => action.type === SocketEventType.MESSAGE
    );

    if (connectedAction) {
      void this.executeAction(socket, controller, connectedAction);
    }

    if (disconnectedAction) {
      socket.on('disconnect', () => {
        void this.executeAction(socket, controller, disconnectedAction);
      });
    }

    if (disconnectingAction) {
      socket.on('disconnecting', () => {
        void this.executeAction(socket, controller, disconnectingAction);
      });
    }

    for (const messageAction of messageActions) {
      socket.on(messageAction.options.name, (...args: any[]) => {
        const messages: any[] = args.slice(0, -1);
        let ack: Function | null = args[args.length - 1];

        if (!(ack instanceof Function)) {
          messages.push(ack);
          ack = null;
        }

        void this.executeAction(socket, controller, messageAction, messageAction.options.name as string, messages, ack);
      });
    }
  }

  private async executeAction(
    socket: Socket,
    controller: HandlerMetadata<ControllerMetadata>,
    action: ActionMetadata,
    eventName?: string,
    data?: any[],
    ack?: Function | null
  ) {
    const eventContext = this.resolveEventContext(
      socket,
      action.type,
      eventName,
      data,
      controller.metadata.namespace,
      ack
    );

    let container = this.container;
    if (this.options.scopedContainerGetter) {
      container = this.options.scopedContainerGetter(eventContext);
    }

    try {
      const controllerInstance: any = container.get(controller.target);

      const actions = [
        ...(action.interceptors || []).map(interceptor => {
          return (
            ((interceptor as any) instanceof Function
              ? container.get(interceptor)
              : interceptor) as InterceptorInterface
          ).use.bind(interceptor);
        }),
        (context: SocketEventContext) => {
          const parameters = this.resolveParameters(
            socket,
            controller.metadata,
            action.parameters || [],
            context.messageArgs,
            ack
          );
          return controllerInstance[action.methodName](...parameters);
        },
      ];

      const actionResult = chainExecute(eventContext, actions);
      const result = await Promise.resolve(actionResult);
      this.handleActionResult(socket, action, result, ResultType.EMIT_ON_SUCCESS);
    } catch (error: any) {
      this.handleActionResult(socket, action, error, ResultType.EMIT_ON_FAIL);
    }

    if (this.options.scopedContainerDisposer) {
      this.options.scopedContainerDisposer(container);
    }
  }

  private handleActionResult(socket: Socket, action: ActionMetadata, result: any, resultType: ResultType) {
    const allOnResultActions = action.results?.filter(result => result.type === resultType) || [];
    const skipOnEmpty = action.results?.some(result => result.type === ResultType.SKIP_EMIT_ON_EMPTY_RESULT);

    if (result == null && skipOnEmpty) {
      return;
    }

    let onResultActions = allOnResultActions;
    if (onResultActions.some(action => action.options.errorType)) {
      const firstFittingAction = allOnResultActions.find(
        action => action.options.errorType && result instanceof (action.options.errorType as Function)
      );

      if (!firstFittingAction) {
        onResultActions = allOnResultActions.filter(action => !action.options.errorType);
      } else {
        onResultActions = [firstFittingAction];
      }
    }

    for (const onResultAction of onResultActions) {
      const transformedValue =
        result instanceof Error
          ? result.message
          : this.transformActionValue(result as never, null, onResultAction.options, 'result');
      socket.emit(onResultAction.options.messageName as never, transformedValue);
    }
  }

  private registerMiddleware(namespace: Namespace, middleware: HandlerMetadata<MiddlewareMetadata>) {
    namespace.use((socket: Socket, next: (err?: any) => void) => {
      const instance: MiddlewareInterface = this.container.get(middleware.target);
      instance.use(socket, next);
    });
  }

  private resolveParameters(
    socket: Socket,
    controllerMetadata: ControllerMetadata,
    parameterMetadatas: ParameterMetadata[],
    data?: any[],
    ack?: Function | null
  ) {
    const parameters = [];

    for (const metadata of parameterMetadatas) {
      const parameterValue = this.resolveParameter(socket, controllerMetadata, metadata, data, ack) as never;
      parameters[metadata.index] = this.transformActionValue(
        parameterValue,
        metadata.reflectedType as never,
        metadata.options,
        'parameter'
      );
    }

    return parameters;
  }

  private resolveParameter(
    socket: Socket,
    controller: ControllerMetadata,
    parameter: ParameterMetadata,
    data?: any[],
    ack?: Function | null
  ) {
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
        return data?.[(parameter.options.index as number) || 0];
      case ParameterType.MESSAGE_ACK:
        return ack;
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

  private resolveEventContext(
    socket: Socket,
    eventType: SocketEventType,
    eventName?: string,
    messageBody?: any[],
    namespace?: string | RegExp,
    ack?: Function | null
  ): SocketEventContext {
    return {
      eventType,
      eventName,
      socket,
      socketIo: this.io,
      nspParams: this.extractNamespaceParameters(socket, namespace),
      messageArgs: messageBody,
      ack,
    };
  }

  private extractNamespaceParameters(
    socket: Socket,
    namespace: string | RegExp | undefined,
    parameterMetadata?: ParameterMetadata
  ) {
    let keys: any[];
    let regexp: RegExp;

    if (namespace instanceof RegExp) {
      regexp = namespace;
      keys = [];
    } else {
      const pathToRegexpResult = pathToRegexp(namespace || '/');
      regexp = pathToRegexpResult.regexp;
      keys = pathToRegexpResult.keys;
    }

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
