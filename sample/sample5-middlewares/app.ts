import "reflect-metadata";
import {createSocketIoServer} from "../../src/index";

// import all required files

import "./AuthenitificationMiddleware";
import "./MessageController";

createSocketIoServer(3001); // creates socket.io server and registers all controllers there

console.log("Socket.io is up and running on port 3001. Send messages via socket-io client.");