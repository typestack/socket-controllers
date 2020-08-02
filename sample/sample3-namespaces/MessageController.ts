import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
} from '../../src/decorators';
import { Message } from './Message';

@SocketController('/messages')
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
  save(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
    console.log('received message:', message);
    console.log('setting id to the message and sending it back to the client');
    message.id = 1;
    socket.emit('message_saved', message);
  }
}
