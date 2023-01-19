import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { EmitOnSuccess, OnMessage } from '../../src';

describe('EmitOnSuccess', () => {
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

  it('Emit defined event on successful sync execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnSuccess('response')
      testEvent() {
        throw new Error('error string');
      }

      @OnMessage('request2')
      @EmitOnSuccess('response')
      testEvent2() {
        return 'data';
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    const responses = [];

    wsClient.on('response', data => {
      responses.push(data);
    });

    await waitForEvent(wsClient, 'connected');
    expect(responses.length).toEqual(0);

    wsClient.emit('request');
    wsClient.emit('request2');
    await waitForEvent(wsClient, 'response');
    expect(responses[0]).toEqual('data');
    expect(responses.length).toEqual(1);
  });

  it('Emit defined event on successful async execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnSuccess('response')
      async testEvent() {
        throw new Error('error string');
      }

      @OnMessage('request2')
      @EmitOnSuccess('response')
      async testEvent2() {
        return 'data';
      }
    }

    socketControllers = new SocketControllers({
      io: wsApp,
      container: Container,
      controllers: [TestController],
    });
    wsClient = io(PATH_FOR_CLIENT + '/string', { reconnection: false, timeout: 5000, forceNew: true });

    const responses = [];

    wsClient.on('response', data => {
      responses.push(data);
    });

    await waitForEvent(wsClient, 'connected');
    expect(responses.length).toEqual(0);

    wsClient.emit('request');
    wsClient.emit('request2');
    await waitForEvent(wsClient, 'response');
    expect(responses[0]).toEqual('data');
    expect(responses.length).toEqual(1);
  });
});
