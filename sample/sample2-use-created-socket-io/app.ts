import 'reflect-metadata';
import { useSocketServer } from '../../src/index';
import { MessageController } from './MessageController';

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3001);

app.get('/', function (req: any, res: any) {
  res.send('hello express');
});

io.use((socket: any, next: Function) => {
  console.log('Custom middleware');
  next();
});
useSocketServer(io, {
  controllers: [MessageController],
});

console.log('Socket.io is up and running on port 3001. Send messages via socket-io client.');
