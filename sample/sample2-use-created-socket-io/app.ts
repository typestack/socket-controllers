import 'reflect-metadata';
import { SocketControllers } from '../../src/index';
import { MessageController } from './MessageController';
import { Server } from 'socket.io';
import { Container } from 'typedi';
import express from 'express'
import http from 'http'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

server.listen(3001);

app.get('/', function (req: any, res: any) {
  res.send('hello express');
});

io.use((socket: any, next: Function) => {
  console.log('Custom middleware');
  next();
});
new SocketControllers({
  io,
  container: Container,
  controllers: [MessageController],
});

console.log('Socket.io is up and running on port 3001. Send messages via socket-io client.');
