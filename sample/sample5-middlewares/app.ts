import 'reflect-metadata';
import { SocketControllers } from '../../src/index';
import { AuthenticationMiddleware } from './AuthenticationMiddleware';
import { MessageController } from './MessageController';
import { Container } from 'typedi';

new SocketControllers({
  port: 3001,
  container: Container,
  controllers: [MessageController],
  middlewares: [AuthenticationMiddleware],
}); // creates socket.io server and registers all controllers and middlewares there

console.log('Socket.io is up and running on port 3001. Send messages via socket-io client.');
