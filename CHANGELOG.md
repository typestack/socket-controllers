# Changelog

_This changelog follows the [keep a changelog][keep-a-changelog]_ format to maintain a human readable changelog.

## [0.1.1](https://github.com/typestack/socket-controllers/compare/v0.1.0...v0.1.1) (2023-01-27)

### Added

- Added `@OnDisconnecting()` decorator
- Added error type filter option to `@EmitOnFail()` decorator
  
  Example: `@EmitOnFail('message', {errorType: TypeError})`

- Added `index` option to `@MessageBody()` decorator to be able to get multiple event arguments

  Note: If you don't specify the index it will return the first

- Added support to use the same namespace for multiple controllers

  Note: The namespaces must match exactly, providing a differnet pattern will not work due to a socket.io limitation

### Changed

- `glob` package updated from `8.0.3` to `8.1.0`

## [0.1.0](https://github.com/typestack/socket-controllers/compare/v0.0.5...v0.1.0) (2023-01-18)

### Breaking Changes

- Removed `createSocketServer()` in favor of constructor initialization 

  BEFORE:

  ```ts
  import { useSocketServer } from 'socket-controllers';
  import { Server } from 'socket.io';

  const io = new Server(PORT);
  useSocketServer(io);
  ```

  AFTER:

  ```ts
  import { SocketControllers } from "socket-controllers";
  import { Server } from "socket.io";

  const io = new Server(PORT);
  new SocketControllers({io: io, container: YOUR_DI_CONTAINER});
  ```
- Removed `createSocketServer()` in favor of constructor initialization 

  BEFORE:

  ```ts
  import { createSocketServer } from 'socket-controllers';

  const io = createSocketServer(PORT);
  ```

  AFTER:

  ```ts
  import { SocketControllers } from "socket-controllers";

  const server = new SocketControllers({port: PORT, container: YOUR_DI_CONTAINER});
  const io = server.io;
  ```

- Removed `useContainer()` in favor of constructor initialization

  BEFORE:

  ```ts
  import { useContainer } from 'socket-controllers';
  import { Container } from 'typedi';

  useContainer(Container);
  ```

  AFTER:

  ```ts
  import { SocketControllers } from "socket-controllers";
  import { Container } from 'typedi';

  const server = new SocketControllers({port: PORT, container: Container});
  ```
  > Note: DI container is not included anymore, you have to provide your own.

- Changed initialization parameters

  Before:
  ```typescript
  interface SocketControllersOptions {
    controllers?: Function[] | string[];
    middlewares?: Function[] | string[];
    useClassTransformer?: boolean;
    classToPlainTransformOptions?: ClassTransformOptions;
    plainToClassTransformOptions?: ClassTransformOptions;
  }
  ```

  After:
  ```typescript
  interface SocketControllersOptions {
    container: { get<T>(someClass: { new (...args: any[]): T } | Function): T };
    io?: Server;
    port?: number;
    controllers?: Function[] | string[];
    middlewares?: Function[] | string[];
    transformOption?: Partial<{
      transform?: boolean;
      parameterTransformOptions?: ClassTransformOptions;
      resultTransformOptions?: ClassTransformOptions;
    }>;
  }
  ```

- Changed class-transformer property name in decorators that support class-transformer

  Before:
  `classTransformOptions?: ClassTransformOptions`

  After:
  `transformOptions?: ClassTransformOptions`

### Added
- Namespace scope support for middlewares
- `transform: boolean` option to decorators that support class-transformer

### Changed

- `class-transformer` package updated from `0.1.6` to `0.5.1`
- `path-to-regexp` package updated from `3.0.0` to `6.2.1`
- `reflect-metadata` package updated from `0.1.10` to `0.1.13`
- `socket.io` package updated from `2.0.1` to `4.5.4`
- updated various dev dependencies


### [0.0.5][v0.0.5] - 2020-02-04

#### Added

- Added support dynamic namespace
- Added `NspParams`, `NspParam` decorators to handle dynamic namespace name params
- Allowed use function array for controllers and middlewares

#### Fixed

- Import middlewares from directory

[v0.0.5]: https://github.com/typestack/socket-controllers/compare/v0.0.4...v0.0.5
[keep-a-changelog]: https://keepachangelog.com/en/1.0.0/
