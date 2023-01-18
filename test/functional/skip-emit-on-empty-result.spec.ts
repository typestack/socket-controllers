import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { SocketControllers } from '../../src/SocketControllers';
import { Container, Service } from 'typedi';
import { SocketController } from '../../src/decorators/SocketController';
import { OnConnect } from '../../src/decorators/OnConnect';
import { ConnectedSocket } from '../../src/decorators/ConnectedSocket';
import { waitForEvent } from '../utilities/waitForEvent';
import { EmitOnFail, EmitOnSuccess, OnMessage, SkipEmitOnEmptyResult } from '../../src';

describe('SkipEmitOnEmptyResult', () => {
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

  it('Skip emit of defined event on successful sync execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnSuccess('response')
      @SkipEmitOnEmptyResult()
      testEvent() {
        return { data: true };
      }

      @OnMessage('request2')
      @EmitOnSuccess('response')
      @SkipEmitOnEmptyResult()
      testEvent2() {
        return null;
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

    wsClient.emit('request2');
    wsClient.emit('request');

    await waitForEvent(wsClient, 'response');
    expect(responses.length).toEqual(1);
    expect(responses[0]).toEqual({ data: true });
  });

  it('Skip emit of defined event on successful async execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      async connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnSuccess('response')
      @SkipEmitOnEmptyResult()
      async testEvent() {
        return { data: true };
      }

      @OnMessage('request2')
      @EmitOnSuccess('response')
      @SkipEmitOnEmptyResult()
      async testEvent2() {
        return null;
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

    wsClient.emit('request2');
    wsClient.emit('request');

    await waitForEvent(wsClient, 'response');
    expect(responses.length).toEqual(1);
    expect(responses[0]).toEqual({ data: true });
  });

  it('Skip emit of defined event on failing sync execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnFail('response')
      @SkipEmitOnEmptyResult()
      testEvent() {
        throw new Error('error string');
      }

      @OnMessage('request2')
      @EmitOnFail('response')
      @SkipEmitOnEmptyResult()
      testEvent2() {
        return Promise.reject(null);
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

    wsClient.emit('request2');
    wsClient.emit('request');

    await waitForEvent(wsClient, 'response');
    expect(responses.length).toEqual(1);
    expect(responses[0]).toEqual('error string');
  });

  it('Skip emit of defined event on failing async execution', async () => {
    @SocketController('/string')
    @Service()
    class TestController {
      @OnConnect()
      async connected(@ConnectedSocket() socket: Socket) {
        socket.emit('connected');
      }

      @OnMessage('request')
      @EmitOnFail('response')
      @SkipEmitOnEmptyResult()
      async testEvent() {
        throw new Error('error string');
      }

      @OnMessage('request2')
      @EmitOnFail('response2')
      @SkipEmitOnEmptyResult()
      async testEvent2(@ConnectedSocket() socket: Socket) {
        return Promise.reject(null);
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

    wsClient.emit('request2');
    wsClient.emit('request');

    await waitForEvent(wsClient, 'response');
    expect(responses.length).toEqual(1);
    expect(responses[0]).toEqual('error string');
  });
});
