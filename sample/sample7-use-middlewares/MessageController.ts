import {OnConnect, SocketController, ConnectedSocket, OnDisconnect, MessageBody, OnMessage} from "../../src/index";
import {Message} from "./Message";
import {UseMiddleware} from "../../src/decorator/UseMiddleware";
import {AuthenticationMiddleware} from "./AuthenticationMiddleware";

@UseMiddleware(AuthenticationMiddleware)
@SocketController()
export class MessageController {

    @OnConnect()
    connection(@ConnectedSocket() socket: any) {
        console.log("client connected");
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: any) {
        console.log("client disconnected");
    }

    @OnMessage("save")
    save(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
        console.log("received message:", message);
        console.log("setting id to the message and sending it back to the client");
        message.id = 1;
        socket.emit("message_saved", message);
    }

}