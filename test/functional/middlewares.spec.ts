import { Server } from 'socket.io';
import { Socket, io } from 'socket.io-client';
import {
  ConnectedSocket,
  defaultMetadataArgsStorage,
  Middleware,
  MiddlewareInterface,
  OnConnect,
  SocketController,
  useContainer,
  useSocketServer,
} from '../../src';
import { Container, Service } from 'typedi';
import { waitForEvent } from '../utilities/waitForEvent';
import { createServer, Server as HttpServer } from 'http';

describe('Middlewares', () => {
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  let httpServer: HttpServer;
  let wsApp: Server;
  let wsClient: Socket;
  let testResult;

  beforeEach(done => {
    httpServer = createServer();
    wsApp = new Server(httpServer, {
      cors: {
        origin: '*',
      },
    });
    httpServer.listen(PORT, () => {
      done();
    });
    useContainer(Container);
  });

  afterEach(() => {
    testResult = undefined;

    Container.reset();
    wsClient.close();
    wsClient = null;
    defaultMetadataArgsStorage().reset();
    return new Promise(resolve => {
      if (wsApp)
        return wsApp.close(() => {
          resolve(null);
        });
      resolve(null);
    });
  });

  it('no namespace', async () => {
    @Middleware()
    @Service()
    class GlobalMiddleware implements MiddlewareInterface {
      use(socket: any, next: (err?: any) => any): any {
        testResult = 'global middleware';
        next();
      }
    }

    @SocketController()
    @Service()
    class Controller {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }
    }

    useSocketServer(wsApp, {
      middlewares: [GlobalMiddleware],
      controllers: [Controller],
    });
    wsClient = io(PATH_FOR_CLIENT, { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    expect(testResult).toEqual('global middleware');
  });

  describe('string namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: '/string' })
      @Service()
      class StringNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = 'string middleware';
          next();
        }
      }

      @SocketController('/string')
      @Service()
      class StringNamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [StringNamespaceMiddleware],
        controllers: [StringNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual('string middleware');
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: '/string' })
      @Service()
      class StringNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = 'string middleware';
          next();
        }
      }

      @SocketController('/string2')
      @Service()
      class String2NamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [StringNamespaceMiddleware],
        controllers: [String2NamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/string2', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(undefined);
    });
  });

  describe('regexp namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: /^\/dynamic-\d+$/ })
      @Service()
      class RegexpNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = socket.nsp.name;
          next();
        }
      }

      @SocketController(/^\/dynamic-\d+$/)
      @Service()
      class RegexpNamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [RegexpNamespaceMiddleware],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual('/dynamic-1');
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: /^\/dynamic-\s+$/ })
      @Service()
      class RegexpNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = socket.nsp.name;
          next();
        }
      }

      @SocketController(/^\/dynamic-\d+$/)
      @Service()
      class RegexpNamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [RegexpNamespaceMiddleware],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(undefined);
    });
  });

  describe('array namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: [/^\/dynamic-\d+$/] })
      @Service()
      class RegexpArrayNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = socket.nsp.name;
          next();
        }
      }

      @SocketController(/^\/dynamic-\d+$/)
      @Service()
      class RegexpNamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [RegexpArrayNamespaceMiddleware],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual('/dynamic-1');
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: [/^\/dynamic-\s+$/] })
      @Service()
      class RegexpArrayNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult = socket.nsp.name;
          next();
        }
      }

      @SocketController(/^\/dynamic-\d+$/)
      @Service()
      class RegexpNamespaceController {
        @OnConnect()
        connected(@ConnectedSocket() socket: Socket) {
          socket.emit('connected');
        }
      }

      useSocketServer(wsApp, {
        middlewares: [RegexpArrayNamespaceMiddleware],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(undefined);
    });
  });
});
