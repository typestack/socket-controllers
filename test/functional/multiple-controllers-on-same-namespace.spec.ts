import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { ConnectedSocket, OnConnect, SocketController, SocketControllers } from '../../src';
import { Container, Service } from 'typedi';
import { waitForTime } from '../utilities/waitForTime';

describe('Multiple controllers with same namespace', () => {
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

  it('using string namespace', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        testResult = [...(testResult || []), '1'];
        socket.emit('connected');
      }
    }

    @SocketController('/string')
    @Service()
    class TestController2 {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        testResult = [...(testResult || []), '2'];
        socket.emit('connected2');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController, TestController2],
    });
    await socketControllers.initialize();
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForTime(100);
    expect(testResult).toContain('1');
    expect(testResult).toContain('2');
  });
});
