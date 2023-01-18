import { Message } from './Message';
import { ConnectedSocket, MessageBody, OnConnect, OnDisconnect, OnMessage, SocketController } from '../../src';

@SocketController()
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
