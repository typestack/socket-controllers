import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { EmitOnSuccess, MessageBody, OnMessage, SocketEventType } from '../../src';
import { UseInterceptor } from '../../src/decorators/UseInterceptor';
import { InterceptorInterface } from '../../src/types/InterceptorInterface';
import { SocketEventContext } from '../../src/types/SocketEventContext';

describe('UseInterceptor', () => {
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

  it('interceptor should be executed in the correct order', async () => {
    @Service()
    class testInterceptor implements InterceptorInterface {
      use(ctx: SocketEventContext, next: any) {
        testResult.push('testInterceptor start');
        const resp = next();
        testResult.push('testInterceptor end');
        return resp;
      }
    }

    const plain: InterceptorInterface = {
      use: (ctx: SocketEventContext, next: () => any) => {
        testResult.push('plain start');
        const resp = next();
        testResult.push('plain end');
        return resp;
      },
    };

    @SocketController('/string')
    @Service()
    @UseInterceptor(plain)
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @UseInterceptor(testInterceptor)
      @EmitOnSuccess('finished')
      test() {
        testResult.push('action');
        return 'test';
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    const response = await waitForEvent(wsClient, 'finished');
    expect(testResult).toEqual([
      'plain start',
      'plain end',
      'plain start',
      'testInterceptor start',
      'action',
      'testInterceptor end',
      'plain end',
    ]);
    expect(response).toEqual('test');
  });

  it('interceptor should be able to skip further actions', async () => {
    @Service()
    class testInterceptor implements InterceptorInterface {
      use(ctx: SocketEventContext, next: any) {
        testResult.push('testInterceptor start');
        const response = next();
        testResult.push('testInterceptor end');
        return response;
      }
    }

    const plain: InterceptorInterface = {
      use: (ctx: SocketEventContext, next: () => any) => {
        testResult.push('plain start');

        if (ctx.eventType === SocketEventType.CONNECT) {
          next();
        }

        testResult.push('plain end');
        return 'plain response';
      },
    };

    @SocketController('/string')
    @Service()
    @UseInterceptor(plain)
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('test')
      @UseInterceptor(testInterceptor)
      @EmitOnSuccess('finished')
      test() {
        testResult.push('action');
        return 'test';
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    const response = await waitForEvent(wsClient, 'finished');
    expect(testResult).toEqual(['plain start', 'plain end', 'plain start', 'plain end']);
    expect(response).toEqual('plain response');
  });

  it('interceptor should be able to mutate the context', async () => {
    @Service()
    class testInterceptor implements InterceptorInterface {
      use(ctx: SocketEventContext, next: any) {
        testResult.push(ctx.messageArgs?.[0]);
        ctx.messageArgs = ['testInterceptor'];
        return next();
      }
    }

    const plain: InterceptorInterface = {
      use: (ctx: SocketEventContext, next: () => any) => {
        testResult.push(ctx.messageArgs?.[0]);
        ctx.messageArgs = ['plain'];
        return next();
      },
    };

    @SocketController('/string')
    @Service()
    @UseInterceptor(plain)
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        testResult.push(message);
        socket.emit('connected');
      }

      @OnMessage('test')
      @UseInterceptor(testInterceptor)
      @EmitOnSuccess('finished')
      test(@MessageBody() message: any) {
        testResult.push(message);
        return 'test';
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test', 'my body');
    const response = await waitForEvent(wsClient, 'finished');
    expect(testResult).toEqual([undefined, 'plain', 'my body', 'plain', 'testInterceptor']);
    expect(response).toEqual('test');
  });
});
