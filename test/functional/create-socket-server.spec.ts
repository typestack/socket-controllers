import { SocketController, SocketControllers } from '../../src';
import { testConnection } from '../utilities/testSocketConnection';
import { Container, Service } from 'typedi';

describe('Create socket server', () => {
  let wsApp: SocketControllers;
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  afterEach(() => {
    return new Promise(resolve => {
      if (wsApp)
        return wsApp.io.close(() => {
          resolve(null);
        });
      resolve(null);
    });
  });

  it('should create socket server without options', async () => {
    expect.assertions(1);
    wsApp = new SocketControllers({ port: PORT, container: Container });
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });

  it('should create socket server with empty controllers array in options', async () => {
    expect.assertions(1);
    wsApp = new SocketControllers({ port: PORT, controllers: [], container: Container });
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });

  it('should create socket server with controllers array in options', async () => {
    expect.assertions(1);

    @SocketController()
    @Service()
    class TestController {}

    wsApp = new SocketControllers({ port: PORT, container: Container, controllers: [TestController] });
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });
});
