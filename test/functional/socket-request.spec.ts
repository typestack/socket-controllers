import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import {
  ConnectedSocket,
  OnConnect,
  SocketController,
  SocketControllers,
  SocketQueryParam,
  SocketRequest,
} from '../../src';
import { Container, Service } from 'typedi';
import { waitForEvent } from '../utilities/waitForEvent';

describe('SocketRequest', () => {
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

  it('Socket request is retrieved correctly', async () => {
    @SocketController()
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket, @SocketRequest() request: any) {
        testResult = request;
        socket.emit('connected');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    await socketControllers.initialize();
    wsClient = io(PATH_FOR_CLIENT + '?testParam=testValue', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    expect(testResult.url).toContain('/socket.io/?testParam=testValue&EIO=');
  });
});
