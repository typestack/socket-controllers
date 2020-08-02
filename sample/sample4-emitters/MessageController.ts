import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  EmitOnSuccess,
  EmitOnFail,
  SkipEmitOnEmptyResult,
} from '../../src/decorators';
import { Message } from './Message';

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
  @EmitOnSuccess('message_save_success')
  @EmitOnFail('message_save_failed')
  @SkipEmitOnEmptyResult()
  save(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
    console.log('received message:', message);
    console.log('setting id to the message and sending it back to the client');
    message.id = 1;
    return message;
  }

  @OnMessage('try_to_save')
  @EmitOnSuccess('message_save_success')
  @EmitOnFail('message_save_failed')
  @SkipEmitOnEmptyResult()
  trySave(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
    console.log('received message:', message);
    throw new Error('No, cannot save =(');
  }
}
