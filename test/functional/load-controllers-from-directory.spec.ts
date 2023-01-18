import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container } from 'typedi';
import { waitForEvent } from '../utilities/waitForEvent';
import path from 'path';

describe('Load controllers from directory', () => {
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

  it('Load controllers from directory', async () => {
    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [path.join(__dirname, './controllers/**.*')],
    });
    wsClient = io(PATH_FOR_CLIENT, { reconnection: false, timeout: 5000, forceNew: true });

    await waitForEvent(wsClient, 'connected');
    wsClient.emit('test');
    await waitForEvent(wsClient, 'response');
    expect(true).toEqual(true);
  });
});
