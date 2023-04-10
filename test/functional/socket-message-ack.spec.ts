import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { MessageAck, MessageBody, OnMessage, SocketId } from '../../src';

describe('MessageAck', () => {
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  let httpServer: HttpServer;
  let wsApp: Server;
  let wsClient: Socket;
  let testResult;
  let testAckResult;
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
    testAckResult = undefined;

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

  it('Event ack is retrieved correctly', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket, @SocketId() socketId: string) {
        testResult = socketId;
        socket.emit('connected');
      }

      @OnMessage('test')
      test(@MessageBody() data: any, @ConnectedSocket() socket: Socket, @MessageAck() ack: Function) {
        testResult = data;
        testAckResult = ack;
        socket.emit('return');
      }

      @OnMessage('test2')
      test2(
        @MessageAck() ack: Function,
        @MessageBody({ index: 1 }) data1: any,
        @MessageBody({ index: 0 }) data0: any,
        @ConnectedSocket() socket: Socket
      ) {
        testResult = { data1, data0 };
        ack?.('test ack2');
        socket.emit('return2');
      }

      @OnMessage('test3')
      test3(
        @ConnectedSocket() socket: Socket,
        @MessageAck() ack: Function,
        @MessageBody({ index: 1 }) data1: any,
        @MessageBody({ index: 0 }) data0: any
      ) {
        testResult = { data1, data0 };
        testAckResult = ack;
        socket.emit('return3');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');

    const ack = (ack: any) => (testAckResult = ack);

    wsClient.emit('test', 'test data');
    await waitForEvent(wsClient, 'return');
    expect(testResult).toEqual('test data');
    expect(testAckResult).toBeNull();

    wsClient.emit('test2', 'test data 0', 'test data 1', 'test data 2', ack);
    await waitForEvent(wsClient, 'return2');
    expect(testResult).toEqual({ data0: 'test data 0', data1: 'test data 1' });
    expect(testAckResult).toEqual('test ack2');

    // ack should be the last parameter
    wsClient.emit('test3', 'test data 0', 'test data 1', ack, 'test data 2');
    await waitForEvent(wsClient, 'return3');
    expect(testResult).toEqual({ data0: 'test data 0', data1: 'test data 1' });
    expect(testAckResult).toBeNull();
  });
});
