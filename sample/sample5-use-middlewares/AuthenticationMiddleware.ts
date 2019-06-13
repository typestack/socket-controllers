import {MiddlewareInterface} from "../../src/MiddlewareInterface";

export class AuthenticationMiddleware implements MiddlewareInterface {

    use(socket: any, next: ((err?: any) => any)): any {
        console.log(socket);
        console.log("authentication...");
        next();
    }

}