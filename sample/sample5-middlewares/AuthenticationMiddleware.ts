import { Middleware } from '../../src/decorators';
import { MiddlewareInterface } from '../../src/MiddlewareInterface';

@Middleware()
export class AuthenticationMiddleware implements MiddlewareInterface {
  use(socket: any, next: (err?: any) => any): any {
    console.log('authentication...');
    next();
  }
}
