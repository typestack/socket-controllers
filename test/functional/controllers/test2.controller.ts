import { ConnectedSocket, OnMessage, SocketController } from '../../../src';
import { Service } from 'typedi';

@SocketController()
@Service()
export class Test2Controller {
  @OnMessage('test')
  connected(@ConnectedSocket() socket: any) {
    socket.emit('response');
  }
}
