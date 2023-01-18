import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { MessageBody, OnMessage } from '../../src';
import { Expose } from 'class-transformer';

describe('Parameter transformation', () => {
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  let httpServer: HttpServer;
  let wsApp: Server;
  let wsClient: Socket;
  let testResult;
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
    testResult = undefined;

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

  it('Parameters are converted correctly with the given options', async () => {
    class Body {
      @Expose() prop1: string;
      @Expose() prop2: number;
    }

    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        testResult = socket.id;
        socket.emit('connected');
      }

      @OnMessage('test')
      test(
        @ConnectedSocket() socket: Socket,
        @MessageBody({
          transform: true,
          transformOptions: { excludeExtraneousValues: true, enableImplicitConversion: true },
        })
        body: Body
      ) {
        testResult = body;
        socket.emit('result');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');

    wsClient.emit('test', { prop1: 'test', prop2: '2', prop3: 10 });
    await waitForEvent(wsClient, 'result');
    expect(testResult).toBeInstanceOf(Body);
    expect(testResult.prop1).toEqual('test');
    expect(testResult.prop2).toEqual(2);
    expect(testResult.prop3).toEqual(undefined);
  });
});
