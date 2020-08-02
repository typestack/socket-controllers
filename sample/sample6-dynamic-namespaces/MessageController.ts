import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  NspParams,
} from '../../src/decorators';
import { Message } from './Message';

@SocketController('/messages/:id')
export class MessageController {
  @OnConnect()
  connection(@ConnectedSocket() socket: any) {
    console.log('client connected');
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log('client disconnected');
  }

  @OnMessage('save')
  async save(@ConnectedSocket() socket: any, @MessageBody() message: Message, @NspParams() params: any[]) {
    console.log('received message:', message);
    console.log('namespace params:', params);
    console.log('setting id to the message and sending it back to the client');
    message.id = 1;
    socket.emit('message_saved', message);
  }
}
