import { createSocketServer, SocketController } from "../../src";
import { testConnection } from '../utilities/testSocketConnection';

describe('createSocketServer', () => {
  let wsApp: any;
  const PORT = 8080;
  const PATH_FOR_CLIENT = `ws://localhost:${PORT}`;

  afterEach(() => {
    return new Promise(resolve => {
      if (wsApp)
        return wsApp.close(() => {
          resolve(null);
        });
      resolve(null);
    });
  });

  it('should create socket server without options', async () => {
    expect.assertions(1);
    wsApp = await createSocketServer(PORT);
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });

  it('should create socket server with empty controllers array in options', async () => {
    expect.assertions(1);
    wsApp = await createSocketServer(PORT, { controllers: [] });
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });

  it('should create socket server with controllers array in options', async () => {
    expect.assertions(1);

    @SocketController()
    class TestController {}

    wsApp = await createSocketServer(PORT, { controllers: [TestController] });
    expect(await testConnection(PATH_FOR_CLIENT)).toEqual(0);
  });
});
