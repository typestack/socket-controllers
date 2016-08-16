import {OnConnect, SocketController, SocketClient, OnDisconnect, SocketBody, OnMessage} from "../../src/decorators";

@SocketController("/message")
export class MessageController {

    @OnConnect()
    connection(@SocketClient() socket: any) {
        console.log("socket connected");
    }

    @OnDisconnect()
    disconnect(@SocketClient() socket: any) {
        console.log("socket disconnected");
    }

    @OnMessage("save")
    save(@SocketClient() socket: any, @SocketBody() message: any) {
        console.log("recieved save message:", message);
        socket.emit("saveMessage", message);
    }

}