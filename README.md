# socket-controllers

![Build Status](https://github.com/typestack/socket-controllers/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/typestack/socket-controllers/branch/develop/graph/badge.svg)](https://codecov.io/gh/typestack/socket-controllers)
[![npm version](https://badge.fury.io/js/socket-controllers.svg)](https://badge.fury.io/js/socket-controllers)

Use class-based controllers to handle websocket events. Helps to organize your code using websockets in classes.

## Installation

1. Install `socket-controllers`:

   ```
   npm install socket-controllers
   ```

2. Install `reflect-metadata` shim:

   ```
   npm install reflect-metadata
   ```

   and make sure to import it in a global place, like app.ts:

   ```typescript
   import 'reflect-metadata';
   ```
   
3. Install a DI container, for example `typedi`;
   
   ```
   npm install typedi
   ```

## Example of usage

1. Create a file `MessageController.ts`

   ```typescript
   import {
     OnConnect,
     SocketController,
     ConnectedSocket,
     OnDisconnect,
     MessageBody,
     OnMessage,
   } from 'socket-controllers';
   import {Service} from 'typedi'; // Only if you are using typedi

   @SocketController()
   @Service() // Only if you are using typedi
   export class MessageController {
     @OnConnect()
     connection(@ConnectedSocket() socket: any) {
       console.log('client connected');
     }

     @OnDisconnect()
     disconnect(@ConnectedSocket() socket: any) {
       console.log('client disconnected');
     }

     @OnMessage('save')
     save(@ConnectedSocket() socket: any, @MessageBody() message: any) {
       console.log('received message:', message);
       console.log('setting id to the message and sending it back to the client');
       message.id = 1;
       socket.emit('message_saved', message);
     }
   }
   ```

2. Create a file `app.ts`

   ```typescript
   import 'es6-shim'; // this shim is optional if you are using old version of node
   import 'reflect-metadata'; // this shim is required
   import { SocketControllers } from 'socket-controllers';
   import { MessageController } from './MessageController'; 
   import {Container} from 'typedi'; // Only if you are using typedi

   new SocketControllers({
     port: 3001,
     container: Container,
     controllers: [MessageController],
   });
   ```

3. Now you can send `save` websocket message using websocket-client.

## More usage examples

#### Run code on socket client connect / disconnect / disconnecting

Controller action marked with `@OnConnect()` decorator is called once new client connected.
Controller action marked with `@OnDisconnect()` decorator is called once client disconnected.
Controller action marked with `@OnDisconnecting()` decorator is called when the client is disconnecting, before the disconnect event.

```typescript
import { SocketController, OnConnect, OnDisconnect, OnDisconnecting } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnConnect()
  save() {
    console.log('client connected');
  }

  @OnDisconnect()
  save() {
    console.log('client disconnected');
  }

  @OnDisconnecting()
  save() {
    console.log('client is disconnecting');
  }
}
```

#### `@ConnectedSocket()` decorator

To get connected socket instance you need to use `@ConnectedSocket()` decorator.

```typescript
import { SocketController, OnMessage, ConnectedSocket } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@ConnectedSocket() socket: any) {
    socket.emit('save_success');
  }
}
```

#### `@MessageBody()` decorator

To get received message body use `@MessageBody()` decorator:

```typescript
import { SocketController, OnMessage, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@MessageBody() message: any) {
    console.log('received message: ', message);
  }
}
```

If you specify a class type to parameter that is decorated with `@MessageBody()`,
socket-controllers will use [class-transformer][1] to create instance of the given class type with the data received in the message.
To disable this behaviour you need to specify `{ transformOption: { transform: false ] }` in SocketControllerOptions when creating a server.

You can define an index to get multiple parameters from the socket event.

```typescript
import { SocketController, OnMessage, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@MessageBody({index: 0}) param1: any, @MessageBody({index: 1}) param2: any) {
    console.log('received message: ', message1);
    console.log('received message: ', message2);
  }
}
```

#### `@MessageAck()` decorator

To get received message ack use `@MessageAck()` decorator:

```typescript
import { SocketController, OnMessage, MessageAck, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@MessageBody() message: any, @MessageAck() ack: Function) {
    console.log('received message: ', message);
    ack('callback message');
  }
}
```

> note: ack must be the last parameter in `emit`, otherwise it will be `null`

#### `@SocketQueryParam()` decorator

To get received query parameter use `@SocketQueryParam()` decorator.

```typescript
import { SocketController, OnMessage, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@SocketQueryParam('token') token: string) {
    console.log('authorization token from query parameter: ', token);
  }
}
```

#### Get socket client id using `@SocketId()` decorator

To get connected client id use `@SocketId()` decorator.

```typescript
import { SocketController, OnMessage, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@SocketId() id: string) {}
}
```

#### Get access to using socket.io instance using `@SocketIO()` decorator

```typescript
import { SocketController, OnMessage, MessageBody } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  save(@SocketIO() io: any) {
    // now you can broadcast messages to specific rooms or namespaces using io instance
  }
}
```

#### Send message back to client after method execution

You can use `@EmitOnSuccess` decorator:

```typescript
import { SocketController, OnMessage, EmitOnSuccess } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  @EmitOnSuccess('save_successfully')
  save() {
    // after this controller executed "save_successfully" message will be emitted back to the client
  }
}
```

If you return something, it will be returned in the emitted message data:

```typescript
import { SocketController, OnMessage, EmitOnSuccess } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  @EmitOnSuccess('save_successfully')
  save() {
    // after this controller executed "save_successfully" message will be emitted back to the client with message object
    return {
      id: 1,
      text: 'new message',
    };
  }
}
```

You can also control what message will be emitted if there is error/exception during execution:

```typescript
import { SocketController, OnMessage, EmitOnSuccess, EmitOnFail } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('save')
  @EmitOnSuccess('save_successfully')
  @EmitOnFail('save_error_range', {errorType: RangeError})
  @EmitOnFail('save_error_type', {errorType: TypeError})
  @EmitOnFail('save_error')
  save() {
    if (1 === 1) {
      throw new Error('One is equal to one! Fatal error!');
    }
    return {
      id: 1,
      text: 'new message',
    };
  }
}
```

In this case `save_error` message will be sent to the client with `One is equal to one! Fatal error!` error message.
The order is important when defining multiple `@EmitOnFail()` decorators, the first matching errorType will be served

Sometimes you may want to not emit success/error message if returned result is null or undefined.
In such cases you can use `@SkipEmitOnEmptyResult()` decorator.

```typescript
import { SocketController, OnMessage, EmitOnSuccess, EmitOnFail, SkipEmitOnEmptyResult } from 'socket-controllers';

@SocketController()
export class MessageController {
  @OnMessage('get')
  @EmitOnSuccess('get_success')
  @SkipEmitOnEmptyResult()
  get(): Promise<Message[]> {
    return this.messageRepository.findAll();
  }
}
```

In this case if findAll will return undefined, `get_success` message will not be emitted.
If findAll will return array of messages, they will be emitted back to the client in the `get_success` message.
This example also demonstrates Promises support.
If promise returned by controller action, message will be emitted only after promise will be resolved.

#### Using exist server instead of creating a new one

If you need to create and configure socket.io server manually,
you can pass it to the `SocketControllers` constructor.
Here is example of creating socket.io server and configuring it with express:

```typescript
import 'reflect-metadata'; // this shim is required
import { SocketControllers } from 'socket-controllers';
import { Server } from 'socket.io';
import { Container } from 'typedi'; // Only if you are using typedi

const app = require('express')();
const server = require('http').Server(app);
const io = new Server(server);

server.listen(3001);

app.get('/', function (req: any, res: any) {
  res.send('hello express');
});

io.use((socket: any, next: Function) => {
  console.log('Custom middleware');
  next();
});
new SocketControllers({io, container: Container});
```

#### Load all controllers from the given directory

You can load all controllers in once from specific directories, by specifying array of directories via options in
`createSocketServer` or `useSocketServer`:

```typescript
import 'reflect-metadata'; // this shim is required
import { SocketControllers } from 'socket-controllers';
import { Container } from 'typedi'; // Only if you are using typedi

new SocketControllers({
  port: 3000,
  container: Container, 
  controllers: [__dirname + '/controllers/*.js'],
}); // registers all given controllers
```

#### Using socket.io namespaces

To listen to messages only of the specific namespace you can mark a controller with namespace:

```typescript
@SocketController('/messages')
export class MessageController {
  // ...
}
```

Also you can use dynamic namespace, like `express router` patterns:

```typescript
@SocketController('/messages/:userId')
export class MessageController {
  // ...
}
```

## Using middlewares

Middlewares are the functions passed to the `socketIo.use` method.
Middlewares allows you to define a logic that will be executed each time client connected to the server.
To create your middlewares use `@Middleware` decorator:

```typescript
import { Middleware, MiddlewareInterface } from 'socket-controllers';

@Middleware()
export class CompressionMiddleware implements MiddlewareInterface {
  use(socket: any, next: (err?: any) => any) {
    console.log('do something, for example get authorization token and check authorization');
    next();
  }
}
```

You can limit middlewares to namespaces providing either a `string`, `RegExp` or `Array<string | RegExp>` to the `namespace` parameter:

```typescript
import { Middleware, MiddlewareInterface } from 'socket-controllers';

@Middleware({namespace: '/test'})
export class CompressionMiddleware implements MiddlewareInterface {
  use(socket: any, next: (err?: any) => any) {
    console.log('do something, for example get authorization token and check authorization');
    next();
  }
}
```

## Don't forget to load your controllers and middlewares

Controllers and middlewares should be loaded:

```typescript
import 'reflect-metadata';
import { SocketControllers } from 'socket-controllers';
import { MessageController } from './MessageController';
import { MyMiddleware } from './MyMiddleware'; // here we import it
import { Container } from 'typedi'; // Only if you are using typedi
const server = new SocketControllers({
  port: 3000,
  container: Container,
  controllers: [MessageController],
  middlewares: [MyMiddleware],
});
```

Also you can load them from directories. Also you can use glob patterns:

```typescript
import 'reflect-metadata';
import { SocketControllers } from 'socket-controllers';
import { Container } from 'typedi'; // Only if you are using typedi
const server = new SocketControllers({
   port: 3000,
   container: Container,
   controllers: [__dirname + '/controllers/**/*.js'],
   middlewares: [__dirname + '/middlewares/**/*.js'],
});
```

## Using DI container

`socket-controllers` supports a DI container out of the box. You can inject your services into your controllers and
middlewares. Container must be setup during application bootstrap.
Here is example how to integrate socket-controllers with [typedi](https://github.com/pleerock/typedi):

```typescript
import 'reflect-metadata';
import { SocketControllers } from 'socket-controllers';
import { Container } from 'typedi';

// create and run socket server
const server = new SocketControllers({
  port: 3000,
  container: Container,
  controllers: [__dirname + '/controllers/*.js'],
  middlewares: [__dirname + '/middlewares/*.js'],
});
```

That's it, now you can inject your services into your controllers:

```typescript
@Service()
@SocketController()
export class MessageController {
  constructor(private messageRepository: MessageRepository) {}

  // ... controller actions
}
```

> Note: TypeDI won't create instances for unknown classes since 0.9.0, you have to decorate your Class as a `Service()` as well.

### Scoped controllers

You can enable scoped controllers by providing a `scopedContainerGetter` function in SocketServerOptions. This function should return a new container that will be used to instantiate the controller and its dependencies.

You will get a new instance for each event in the controller.

The `scopedContainerGetter` function receives the `SocketEventContext`.

The `scopedContainerDisposer` function receives the container instance you created with `scopedContainerGetter` after the socket action is finished. Use this function to dispose the container if needed.

```typescript
import 'reflect-metadata';
import { SocketControllers, SocketEventContext } from 'socket-controllers';
import { Container, ContainerInstance, Token } from "typedi";

const myDiToken = new Token();

// create and run socket server
const server = new SocketControllers({
   port: 3000,
   container: Container,
   scopedContainerGetter: (args: SocketEventContext) => {
      const container = Container.of(YOUR_REQUEST_CONTEXT);
      container.set(myDiToken, 'MY_VALUE');
      return container;
   },
   scopedContainerDisposer: (container: ContainerInstance) => {
     container.dispose();
   },
   controllers: [__dirname + '/controllers/*.js'],
   middlewares: [__dirname + '/middlewares/*.js'],
});
```

## Interceptors

Interceptors allow you to wrap your event handlers in higher order functions.
With interceptors you can add logging or modify the incoming or outgoing data for event handlers.

```typescript
import {
   SocketController,
   OnMessage,
   EmitOnSuccess,
   EmitOnFail,
   SkipEmitOnEmptyResult,
   UseInterceptor,
   MessageBody
} from 'socket-controllers';

const interceptor: InterceptorInterface = {
   use: (ctx: SocketEventContext, next: () => any) => {
     ctx.messageArgs[0] = 'modified message from controller - ' + ctx.messageArgs[0];
     const resp = next();
     return 'modified response from controller - ' + resp; // modified response from controller - modified response from method - reponse
   },
};

@Service()
class Interceptor implements InterceptorInterface {
   async use(ctx: SocketEventContext, next: () => any) {
     ctx.messageArgs[0] = 'modified message from method - ' + ctx.messageArgs[0];
     const resp = await next();
     return 'modified response from method - ' + resp; // modified response from method - reponse
   }
}

@SocketController()
@UseInterceptor(interceptor)
export class MessageController {
   @OnMessage('get')
   @EmitOnSuccess('get_success')
   @SkipEmitOnEmptyResult()
   @UseInterceptor(Interceptor)
   get(@MessageBody() message: string): Promise<Message[]> {
     console.log(message); // modified message from controller - modified message from method - original message
     return 'response';
   }
}
```

Interceptors are executed in order of definition, starting with the controller interceptors.


## Decorators Reference

| Signature                              | Description                                                                                                                                                                                                                                                                |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@SocketController(namespace?: string\ | Regex)`                                                                                                                                                                                                                                                                    | Registers a class to be a socket controller that can listen to websocket events and respond to them.                                                                                                                                                                       |
| `@OnMessage(messageName: string)`      | Registers controller's action to be executed when socket receives message with given name.                                                                                                                                                                                 |
| `@OnConnect()`                         | Registers controller's action to be executed when client connects to the socket.                                                                                                                                                                                           |
| `@OnDisconnect()`                      | Registers controller's action to be executed when client disconnects from the socket.                                                                                                                                                                                      |
| `@OnDisconnecting()`                   | Registers controller's action to be executed when client is disconnecting from the socket.                                                                                                                                                                                 |
| `@ConnectedSocket()`                   | Injects connected client's socket object to the controller action.                                                                                                                                                                                                         |
| `@SocketIO()`                          | Injects socket.io object that initialized a connection.                                                                                                                                                                                                                    |
| `@MessageBody()`                       | Injects received message body.                                                                                                                                                                                                                                             |
| `@SocketQueryParam(paramName: string)` | Injects query parameter from the received socket request.                                                                                                                                                                                                                  |
| `@SocketId()`                          | Injects socket id from the received request.                                                                                                                                                                                                                               |
| `@SocketRequest()`                     | Injects request object received by socket.                                                                                                                                                                                                                                 |
| `@SocketRooms()`                       | Injects rooms of the connected socket client.                                                                                                                                                                                                                              |
| `@NspParams()`                         | Injects dynamic namespace params.                                                                                                                                                                                                                                          |
| `@NspParam(paramName: string)`         | Injects param from the dynamic namespace.                                                                                                                                                                                                                                  |
| `@Middleware()`                        | Registers a new middleware to be registered in the socket.io.                                                                                                                                                                                                              |
| `@EmitOnSuccess(messageName: string)`  | If this decorator is set then after controller action will emit message with the given name after action execution. It will emit message only if controller succeed without errors. If result is a Promise then it will wait until promise is resolved and emit a message. |
| `@EmitOnFail(messageName: string)`     | If this decorator is set then after controller action will emit message with the given name after action execution. It will emit message only if controller throw an exception. If result is a Promise then it will wait until promise throw an error and emit a message.  |
| `@SkipEmitOnEmptyResult()`             | Used in conjunction with @EmitOnSuccess and @EmitOnFail decorators. If result returned by controller action is null or undefined then messages will not be emitted by @EmitOnSuccess or @EmitOnFail decorators.                                                            |     |

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/socket-controllers/tree/master/sample) for more examples
of usage.

## Related projects

- If you are interested to create controller-based express or koa server use [routing-controllers](https://github.com/pleerock/routing-controllers) module.
- If you need to use dependency injection in use [typedi](https://github.com/pleerock/typedi) module.

[1]: https://github.com/pleerock/class-transformer
