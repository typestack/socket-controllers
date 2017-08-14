import {
    OnConnect,
    SocketController,
    ConnectedSocket,
    OnDisconnect,
    MessageBody,
    OnMessage,
    EmitOnSuccess,
    EmitOnFail,
    EmitOnFailFor,
    SkipEmitOnEmptyResult
} from "../../src/decorators";
import {Message} from "./Message";

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
    @EmitOnSuccess("message_save_success")
    @EmitOnFail("message_save_failed")
    @SkipEmitOnEmptyResult()
    save(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
        console.log("received message:", message);
        console.log("setting id to the message and sending it back to the client");
        message.id = 1;
        return message;
    }

    @OnMessage("try_to_save")
    @EmitOnSuccess("message_save_success")
    @EmitOnFail("message_save_failed")
    @EmitOnFailFor("message_invalid", () => InvalidException)
    @SkipEmitOnEmptyResult()
    trySave(@ConnectedSocket() socket: any, @MessageBody() message: Message) {
        console.log("received message:", message);

        switch (message.text) {
            case "invalid":
                throw new InvalidException("Message Text Invalid");
            case "invalid_empty":
                throw new InvalidException();
            case "empty_no_response":
                throw null;
            default:
                throw new Error("No, cannot save =(");
        }
    }
}

export class InvalidException {
    constructor(public message?: string) { }
}