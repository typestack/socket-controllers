import { Middleware, MiddlewareInterface } from '../../src';

@Middleware()
export class AuthenticationMiddleware implements MiddlewareInterface {
  use(socket: any, next: (err?: any) => any): any {
    console.log('authentication...');
    next();
  }
}
