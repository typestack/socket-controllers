export interface MiddlewareInterface {
  use(socket: any, next: (err?: any) => any): any;
}
