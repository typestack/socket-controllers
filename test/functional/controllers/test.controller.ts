import { ConnectedSocket, OnConnect, SocketController } from '../../../src';
import { Service } from 'typedi';

@SocketController()
@Service()
export class TestController {
  @OnConnect()
  connected(@ConnectedSocket() socket: any) {
    socket.emit('connected');
  }
}
