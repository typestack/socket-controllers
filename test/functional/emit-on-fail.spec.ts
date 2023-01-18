import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { EmitOnFail, OnMessage } from '../../src';

describe('EmitOnFail', () => {
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

  it('Emit defined event on failing sync execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      @EmitOnFail('fail')
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnFail('fail')
      testEvent() {
        throw new Error('error string');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    const errors = [];

    wsClient.on('fail', data => {
      errors.push(data);
    });

    await waitForEvent(wsClient, 'connected');
    expect(errors.length).toEqual(0);

    wsClient.emit('request');
    await waitForEvent(wsClient, 'fail');
    expect(errors[0]).toEqual('error string');
    expect(errors.length).toEqual(1);
  });

  it('Emit defined event on failing async execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      @EmitOnFail('fail')
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnFail('fail')
      async testEvent() {
        throw new Error('error string');
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    const errors = [];

    wsClient.on('fail', data => {
      errors.push(data);
    });

    await waitForEvent(wsClient, 'connected');
    expect(errors.length).toEqual(0);

    wsClient.emit('request');
    await waitForEvent(wsClient, 'fail');
    expect(errors[0]).toEqual('error string');
    expect(errors.length).toEqual(1);
  });
});
