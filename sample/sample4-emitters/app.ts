import 'reflect-metadata';
import { SocketControllers } from '../../src/index';
import { MessageController } from './MessageController';
import { Container } from 'typedi';

new SocketControllers({
  port: 3001,
  container: Container,
  controllers: [MessageController],
}); // creates socket.io server and registers all controllers there

console.log('Socket.io is up and running on port 3001. Send messages via socket-io client.');
