export function chainExecute(context: any, chain: Function[]) {
  function next() {
    const middleware: Function = chain.shift() as Function;

    if (middleware && typeof middleware === 'function') {
      return middleware(context, next);
    }
  }

  return next();
}
