import { Server } from 'socket.io';
import { Socket, io } from 'socket.io-client';
import { Container, Service } from 'typedi';
import { waitForEvent } from '../utilities/waitForEvent';
import { createServer, Server as HttpServer } from 'http';
import { Middleware } from '../../src/decorators/Middleware';
import { MiddlewareInterface } from '../../src/types/MiddlewareInterface';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { SocketControllers } from '../../src/SocketControllers';

describe('Middlewares', () => {
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  let httpServer: HttpServer;
  let wsApp: Server;
  let wsClient: Socket;
  let testResult: string[] = [];
  let socketControllers: SocketControllers;

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
  });

  afterEach(() => {
    testResult = [];

    Container.reset();
    wsClient.close();
    wsClient = null;
    socketControllers = null;
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
        testResult.push('global middleware');
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

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      middlewares: [GlobalMiddleware],
      controllers: [Controller],
    });
    wsClient = io(PATH_FOR_CLIENT, { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    expect(testResult).toEqual(['global middleware']);
  });

  describe('string namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: '/string' })
      @Service()
      class StringNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('string middleware');
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [StringNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [StringNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['string middleware', 'middleware without namespace']);
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: '/string' })
      @Service()
      class StringNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('string middleware');
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [StringNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [String2NamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/string2', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['middleware without namespace']);
    });
  });

  describe('regexp namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: /^\/dynamic-\d+$/ })
      @Service()
      class RegexpNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push(socket.nsp.name as string);
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [RegexpNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['/dynamic-1', 'middleware without namespace']);
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: /^\/dynamic-\s+$/ })
      @Service()
      class RegexpNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push(socket.nsp.name as string);
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [RegexpNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['middleware without namespace']);
    });
  });

  describe('array namespace', () => {
    it('correct namespace', async () => {
      @Middleware({ namespace: [/^\/dynamic-\d+$/] })
      @Service()
      class RegexpArrayNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push(socket.nsp.name as string);
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [RegexpArrayNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['/dynamic-1', 'middleware without namespace']);
    });

    it('incorrect namespace', async () => {
      @Middleware({ namespace: [/^\/dynamic-\s+$/] })
      @Service()
      class RegexpArrayNamespaceMiddleware implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push(socket.nsp.name as string);
          next();
        }
      }

      @Middleware()
      @Service()
      class MiddlewareWithoutNamespace implements MiddlewareInterface {
        use(socket: any, next: (err?: any) => any): any {
          testResult.push('middleware without namespace');
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

      socketControllers = new SocketControllers({
        io: wsApp,
        container: Container,
        middlewares: [RegexpArrayNamespaceMiddleware, MiddlewareWithoutNamespace],
        controllers: [RegexpNamespaceController],
      });
      wsClient = io(PATH_FOR_CLIENT + '/dynamic-1', { reconnection: false, timeout: 5000, forceNew: true });

      await waitForEvent(wsClient, 'connected');
      expect(testResult).toEqual(['middleware without namespace']);
    });
  });
});
