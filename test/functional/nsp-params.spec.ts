import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { NspParams } from '../../src';

describe('NspParams', () => {
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

  it('Namespace params are retrieved correctly', async () => {
    @SocketController('/:first/:second')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket, @NspParams() parameters: { first: string; second: string }) {
        testResult = parameters;
        socket.emit('connected');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    await socketControllers.initialize();
    wsClient = io(PATH_FOR_CLIENT + '/test1/test2', { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    expect(testResult).toEqual({ first: 'test1', second: 'test2' });
  });
});
