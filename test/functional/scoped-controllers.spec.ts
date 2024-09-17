import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, ContainerInstance, Inject, Service, Token } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { EmitOnSuccess, OnMessage, SocketEventContext } from '../../src';

describe('Scoped controllers', () => {
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  let httpServer: HttpServer;
  let wsApp: Server;
  let wsClient: Socket;
  let testResult = [];
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

  it('two instances should be different', async () => {
    @Service()
    class TestService {}

    @SocketController('/string')
    @Service()
    class TestController {
      constructor(private testService: TestService) {}

      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @EmitOnSuccess('done')
      test() {
        testResult.push(this.testService);
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
      scopedContainerGetter: (args: SocketEventContext) => {
        return Container.of(Math.random().toString());
      },
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    expect(testResult[0]).not.toBe(testResult[1]);
  });

  it('two global instances should be the same', async () => {
    @Service({ global: true })
    class TestService {}

    @SocketController('/string')
    @Service()
    class TestController {
      constructor(private testService: TestService) {}

      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @EmitOnSuccess('done')
      test() {
        testResult.push(this.testService);
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
      scopedContainerGetter: (args: SocketEventContext) => {
        return Container.of(Math.random().toString());
      },
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    expect(testResult[0]).toBe(testResult[1]);
  });

  it('additional injectables should be retrievable', async () => {
    const token = new Token('ADDITIONAL');
    let counter = 0;

    @Service({ global: true })
    class TestService {}

    @SocketController('/string')
    @Service()
    class TestController {
      constructor(
        private testService: TestService,
        @Inject(token) public myAdditional: number
      ) {}

      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @EmitOnSuccess('done')
      test() {
        testResult.push(this.myAdditional);
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
      scopedContainerGetter: (args: SocketEventContext) => {
        const container = Container.of(counter.toString());
        container.set(token, counter);
        counter++;
        return container;
      },
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');
    expect(testResult[0]).toBe(1);
    expect(testResult[1]).toBe(2);
  });

  it('arguments should be provided correctly to getter', async () => {
    @SocketController('/:test')
    @Service()
    class TestController {
      @OnConnect()
      @EmitOnSuccess('connected')
      connected(@ConnectedSocket() socket: Socket) {}

      @OnMessage('test')
      @EmitOnSuccess('done')
      test() {}
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
      scopedContainerGetter: (args: SocketEventContext) => {
        testResult.push(args);
        return Container.of('');
      },
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test', 'args1');
    await waitForEvent(wsClient, 'done');

    expect(testResult[1].socket.id).toEqual(wsClient.id);
    expect(testResult[1].socketIo).toBe(socketControllers.io);
    expect(testResult[1].eventName).toBe('test');
    expect(testResult[1].messageArgs).toEqual(['args1']);
    expect(testResult[1].nspParams).toEqual({ test: 'string' });
  });

  it('container should be disposed', async () => {
    const token = new Token('ADDITIONAL');

    @Service({ global: true })
    class TestService {}

    @SocketController('/string')
    @Service()
    class TestController {
      constructor(
        private testService: TestService,
        @Inject(token) public myAdditional: number
      ) {}

      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @EmitOnSuccess('done')
      test() {
        testResult.push(this.myAdditional);
      }
    }

    let container;
    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
      scopedContainerGetter: () => {
        container = Container.of('test');
        container.set(token, 'test');
        return container;
      },
      scopedContainerDisposer: (scopedContainer: ContainerInstance) => {
        scopedContainer.reset({ strategy: 'resetServices' });
      },
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'done');

    expect(Container.has(TestService)).toBe(true);
    expect(container.has(token)).toBe(false);
    expect(container.has(TestController)).toBe(false);
  });
});
