# socket-controllers

[![Build Status](https://travis-ci.org/pleerock/socket-controllers.svg?branch=master)](https://travis-ci.org/pleerock/socket-controllers)
[![codecov](https://codecov.io/gh/pleerock/socket-controllers/branch/master/graph/badge.svg)](https://codecov.io/gh/pleerock/socket-controllers)
[![npm version](https://badge.fury.io/js/socket-controllers.svg)](https://badge.fury.io/js/socket-controllers)
[![Dependency Status](https://david-dm.org/pleerock/socket-controllers.svg)](https://david-dm.org/pleerock/socket-controllers)
[![devDependency Status](https://david-dm.org/pleerock/socket-controllers/dev-status.svg)](https://david-dm.org/pleerock/socket-controllers#info=devDependencies)
[![Join the chat at https://gitter.im/pleerock/socket-controllers](https://badges.gitter.im/pleerock/socket-controllers.svg)](https://gitter.im/pleerock/socket-controllers?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Allows to create controller classes with methods as actions that handle requests.
You can use socket-controllers with [express.js][1] or [koa.js][2].

## Installation

1. Install module:

    `npm install socket-controllers --save`

2. `reflect-metadata` shim is required:

    `npm install reflect-metadata --save`

    and make sure to import it in a global place, like app.ts:

    ```typescript
    import "reflect-metadata";
    ```

3. ES6 features are used, if you are using old version of node.js you may need to install
 [es6-shim](https://github.com/paulmillr/es6-shim):

    `npm install es6-shim --save`

    and import it in a global place like app.ts:

    ```typescript
    import "es6-shim";
    ```

4. Install framework:

    **a. If you want to use socket-controllers with *express.js*, then install it and all required dependencies:**

    `npm install express body-parser multer --save`

    Optionally you can also install its [typings](https://github.com/typings/typings):

    `typings install dt~express dt~serve-static --save --global`

    **b. If you want to use socket-controllers with *koa 2*, then install it and all required dependencies:**

    `npm install koa@next koa-router@next koa-bodyparser@next --save`

    Optionally you can also install its [typings](https://github.com/typings/typings):

    `typings install dt~koa --save --global`


## Example of usage

1. Create a file `UserController.ts`

    ```typescript
    import {Controller, Param, Body, Get, Post, Put, Delete} from "socket-controllers";

    @Controller()
    export class UserController {

        @Get("/users")
        getAll() {
           return "This action returns all users";
        }

        @Get("/users/:id")
        getOne(@Param("id") id: number) {
           return "This action returns user #" + id;
        }

        @Post("/users")
        post(@Body() user: any) {
           return "Saving user...";
        }

        @Put("/users/:id")
        put(@Param("id") id: number, @Body() user: any) {
           return "Updating a user...";
        }

        @Delete("/users/:id")
        remove(@Param("id") id: number) {
           return "Removing user...";
        }

    }
    ```

    This class will register routes specified in method decorators in your server framework (express.js or koa).

2. Create a file `app.ts`

    ```typescript
    import "es6-shim"; // this shim is optional if you are using old version of node
    import "reflect-metadata"; // this shim is required
    import {createExpressServer} from "socket-controllers";
    import "./UserController";  // we need to "load" our controller before call createServer. this is required
    let app = createExpressServer(); // creates express app, registers all controller routes and returns you express app instance
    app.listen(3000); // run express application
    ```

    > koa users just need to call `createKoaServer` instead of `createExpressServer`

3. Open in browser `http://localhost:3000/users`. You should see `This action returns all users` in your browser.
If you open `http://localhost:3000/users/1` you should see `This action returns user #1` in your browser.

## More usage examples

#### Return promises

You can return a promise in the controller, and it will wait until promise resolved and return in a response a promise result.

```typescript
import {JsonController, Param, Body, Get, Post, Put, Delete} from "socket-controllers";

@JsonController()
export class UserController {

    @Get("/users")
    getAll() {
       return userRepository.findAll();
    }

    @Get("/users/:id")
    getOne(@Param("id") id: number) {
       return userRepository.findById(id);
    }

    @Post("/users")
    post(@Body() user: User) {
       return userRepository.insert(user);
    }

    @Put("/users/:id")
    put(@Param("id") id: number, @Body() user: User) {
       return userRepository.updateById(id, user);
    }

    @Delete("/users/:id")
    remove(@Param("id") id: number) {
       return userRepository.removeById(id);
    }

}
```

#### Using Request and Response objects

You can use framework's request and response objects this way:

```typescript
import {Controller, Req, Res, Get} from "socket-controllers";

@Controller()
export class UserController {

    @Get("/users")
    getAll(@Req() request: any, @Res() response: any) {
        response.send("Hello response!");
    }

}
```

`@Req()` decorator inject you a `Request` object, and `@Res()` decorator inject you a `Response` object.
If you have installed a express typings too, you can use their types:

```typescript
import {Request, Response} from "express";
import {Controller, Req, Res, Get} from "socket-controllers";

@Controller()
export class UserController {

    @Get("/users")
    getAll(@Req() request: Request, @Res() response: Response) {
        response.send("Hello response!");
    }

}
```

#### Using exist server instead of creating a new one

If you have, or if you want to create and configure express app separately,
you can use `useExpressServer` instead of `createExpressServer` function:

```typescript
import "reflect-metadata"; // this shim is required
import {useExpressServer} from "socket-controllers";

let express = require("express"); // or you can import it if you have installed typings
let app = express(); // your created express server
// app.use() // maybe you configure it the way you want
useExpressServer(app); // register created express server in socket-controllers
app.listen(3000); // run your express server
```

> koa users must use `useKoaServer` instead of `useExpressServer`

#### Load all controllers from the given directory

You can load all controllers in once from specific directories, by specifying array of directories via options in
`createExpressServer` or `useExpressServer`:

```typescript
import "reflect-metadata"; // this shim is required
import {createExpressServer, loadControllers} from "socket-controllers";

createExpressServer({
    controllerDirs: [__dirname + "/controllers/*.js"]
}).listen(3000); // register controllers routes in our express application
```

> koa users must use `createKoaServer` instead of `createExpressServer`

#### Load all controllers from the given directory and prefix routes

If you want to prefix all routes in some directory eg. /api 

```typescript
import "reflect-metadata"; // this shim is required
import {createExpressServer} from "socket-controllers";

createExpressServer({
    routePrefix: "/api",
    controllerDirs: [__dirname + "/api/controllers/*.js"] // register controllers routes in our express app
}).listen(3000);
```

> koa users must use `createKoaServer` instead of `createExpressServer`

#### Prefix controller with base route

You can prefix all controller's actions with specific base route:

```typescript
@Controller("/users")
export class UserController {
    // ...
}
```

#### Output JSON instead of regular text content

If you are designing a REST API where your endpoints always return JSON you can use `@JsonController` decorator instead
of `@Controller`. This will guarantee you that data returned by your controller actions always be transformed to JSON
 and `Content-Type` header will be always set to `application/json`:

```typescript
@JsonController()
export class UserController {
    // ...
}
```

#### Per-action JSON / non-JSON output

In the case if you want to control if your controller's action will return json or regular plain text,
you can specify a special option:

```typescript
// this will ignore @Controller if it used and return a json in a response
@Get("/users")
@JsonResponse()
getUsers() {
}

// this will ignore @JsonController if it used and return a regular text in a response
@Get("/posts")
@TextResponse()
getPosts() {
}
```

#### Inject routing parameters

You can use parameters in your routes, and to inject such parameters in your controller methods use `@Param` decorator:

```typescript
@Get("/users/:id")
getUsers(@Param("id") id: number) {
}
```

#### Inject query parameters

To inject query parameters, use `@QueryParam` decorator:

```typescript
@Get("/users")
getUsers(@QueryParam("limit") limit: number) {
}
```

#### Inject request body

To inject request body, use `@Body` decorator:

```typescript
@Post("/users")
saveUser(@Body() user: User) {
}
```

If you specify a class type to parameter that is decorated with `@Body()`,
socket-controllers will use [class-transformer][4] to create instance of the given class type with the data received in request body.
To disable this behaviour you need to specify a `{ useConstructorUtils: false }` in RoutingControllerOptions when creating a server.


#### Inject request body parameters

To inject request body parameter, use `@BodyParam` decorator:

```typescript
@Post("/users")
saveUser(@BodyParam("name") userName: string) {
}
```

#### Inject request header parameters

To inject request header parameter, use `@HeaderParam` decorator:

```typescript
@Post("/users")
saveUser(@HeaderParam("authorization") token: string) {
}
```

#### Inject uploaded file

To inject uploaded file, use `@UploadedFile` decorator:

```typescript
@Post("/files")
saveFile(@UploadedFile("fileName") file: any) {
}
```

Routing-controllers uses [multer][3] to handle file uploads.
You can install multer's file definitions via typings, and use `files: File[]` type instead of `any[]`.
This feature is not supported by koa driver yet.

#### Inject uploaded files

To inject all uploaded files, use `@UploadedFiles` decorator:

```typescript
@Post("/files")
saveAll(@UploadedFiles("files") files: any[]) {
}
```

Routing-controllers uses [multer][3] to handle file uploads.
You can install multer's file definitions via typings, and use `files: File[]` type instead of `any[]`.
This feature is not supported by koa driver yet.

#### Inject cookie parameter

To get a cookie parameter, use `@CookieParam` decorator:

```typescript
@Get("/users")
getUsers(@CookieParam("username") username: string) {
}
```

#### Make parameter required

To make any parameter required, simply pass a `required: true` flag in its options:

```typescript
@Post("/users")
save(@Body({ required: true }) user: any) {
    // your method will not be executed if user is not sent in a request
}
```

Same you can do with all other parameters: @Param, @QueryParam, @BodyParam and others.

#### Convert parameters to objects

If you specify a class type to parameter that is decorated with parameter decorator,
socket-controllers will use [class-transformer][4] to create instance of that class type.
To disable this behaviour you need to specify a `{ useConstructorUtils: false }` in RoutingControllerOptions when creating a server.

```typescript
@Get("/users")
getUsers(@QueryParam("filter") filter: UserFilter) {
    // now you can use your filter, for example
    if (filter.showAll === true)
        return "all users";

    return "not all users";
}

// you can send a request to http://localhost:3000/users?filter={"showAll": true}
// and it will show you "all users"
```

If `UserFilter` is an interface - then simple literal object will be created.
If its a class - then instance of this will be created.

#### Set custom ContentType

You can specify a custom ContentType:

```typescript
@Get("/users")
@ContentType("text/cvs")
getUsers() {
    // ...
}
```
#### Set Location

You can set a location for any action:

```typescript
@Get("/users")
@Location("http://github.com")
getUsers() {
    // ...
}
```

#### Set Redirect

You can set a redirect for any action:

```typescript
@Get("/users")
@Redirect("http://github.com")
getUsers() {
    // ...
}
```

#### Set custom HTTP code

You can explicitly set a returned HTTP code for any action:

```typescript
@HttpCode(201)
@Post("/users")
saveUser(@Body() user: User) {
    // ...
}
```

Also, there are several additional decorators, that sets conditional http code:

```typescript
@Get("/users/:id")
@EmptyResultCode(404)
saveUser(@Param("id") id: number) {
    return userRepository.findOneById(id);
}
```

In this example `findOneById` returns undefined in the case if user with given was not found.
This action will return 404 in the case if user was not found, and regular 200 in the case if it was found.
`@EmptyResultCode` allows to set any HTTP code in the case if controller's action returned empty result (null or undefined).
There are also `@NullResultCode` and `@UndefindeResultCode()` in the case if you want to return specific codes only
if controller's action returned null or undefined respectively.

#### Set custom headers

You can set any custom header in a response:

```typescript
@Get("/users/:id")
@Header("Cache-Control", "none")
getOne(@Param("id") id: number) {
    // ...
}
```
#### Render templates

You can set any custom header in a response:

```typescript
@Get("/users/:id")
@Render("index.html")
getOne() {
    return {
        param1: "these params are used",
        param2: "in templating engine"
    };
}
```

To use rendering ability make sure to configure express properly.
[Here](https://github.com/pleerock/socket-controllers/blob/0.6.0-release/test/functional/render-decorator.spec.ts)
is a test where you can take a look how to do it.
This feature is not supported by koa driver yet.

## Using middlewares

You can use any exist express / koa middleware, or create your own.
To create your middlewares there is a `@Middleware` decorator,
and to use already exist middlewares there are `@UseBefore` and `@UseAfter` decorators.

### Use exist middleware

There are multiple ways to use middlewares.
For example, lets try to use [compression](https://github.com/expressjs/compression) middleware:

1. Install compression middleware: `npm install compression`
2. To use middleware per-action:

    ```typescript
    import {Controller, Get, UseBefore} from "socket-controllers";
    let compression = require("compression");

    // ...

    @Get("/users/:id")
    @UseBefore(compression())
    getOne(@Param("id") id: number) {
        // ...
    }
    ```

    This way compression middleware will be applied only for `getOne` controller action,
    and will be executed *before* action execution.
    To execute middleware *after* action use `@UseAfter` decorator instead.

3. To use middleware per-controller:

    ```typescript
    import {Controller, UseBefore} from "socket-controllers";
    let compression = require("compression");

    @Controller()
    @UseBefore(compression())
    export class UserController {

    }
    ```

    This way compression middleware will be applied for all actions of the `UserController` controller,
    and will be executed *before* its action execution. Same way you can use `@UseAfter` decorator here.

4. If you want to use compression module globally for all controllers you can simply register it during bootstrap:

    ```typescript
    import "reflect-metadata";
    import {createExpressServer} from "socket-controllers";
    import "./UserController";  // we need to "load" our controller before call createExpressServer. this is required
    let compression = require("compression");
    let app = createExpressServer(); // creates express app, registers all controller routes and returns you express app instance
    app.use(compression());
    app.listen(3000); // run express application
    ```

    Alternatively, you can create a custom [global middleware](#global-middlewares) and simply delegate its execution to the compression module.

### Creating your own express middleware

Here is example of creating middleware for express.js:

1. To create your own middleware you need to create a class that implements a `MiddlewareInterface` interface and decorated
with `@Middleware` decorator:

    ```typescript
    import {Middleware, MiddlewareInterface} from "socket-controllers";

    @Middleware()
    export class MyMiddleware implements MiddlewareInterface {

        use(request: any, response: any, next?: (err?: any) => any): any {
            console.log("do something...");
            next();
        }

    }
    ```

    Here, we created our own middleware that prints `do something...` in the console.

2. Second we need to load our middleware in `app.ts` before app bootstrap:

    ```typescript
    import "reflect-metadata";
    import {createExpressServer} from "socket-controllers";
    import "./UserController";
    import "./MyMiddleware"; // here we load it
    createExpressServer().listen(3000);
    ```

3. Now we can use our middleware:

    ```typescript
    import {Controller, UseBefore} from "socket-controllers";
    import {MyMiddleware} from "./MyMiddleware";

    @Controller()
    @UseBefore(MyMiddleware)
    export class UserController {

    }
    ```

    or per-action:

    ```typescript
    @Get("/users/:id")
    @UseBefore(MyMiddleware)
    getOne(@Param("id") id: number) {
        // ...
    }
    ```

    This way your middleware will be executed each time before controller action.
    You can use `@UseAfter(MyMiddleware)` to make it execute after each controller action.

### Creating your own koa middleware

Here is example of creating middleware for koa.js:

1. To create your own middleware you need to create a class that implements a `MiddlewareInterface` interface and decorated
with `@Middleware` decorator:

    ```typescript
    import {Middleware, MiddlewareInterface} from "socket-controllers";

    @Middleware()
    export class MyMiddleware implements MiddlewareInterface {

        use(context: any, next: (err: any) => Promise<any>): Promise<any> {
            console.log("do something before execution...");
            return next().then(() => {
                console.log("do something after execution");
            }).catch(error => {
                console.log("error handling is also here");
            });
        }

    }
    ```

    Here, we created our own middleware that prints `do something...` in the console.

2. Second we need to load our middleware in `app.ts` before app bootstrap:

    ```typescript
    import "reflect-metadata";
    import {createKoaServer} from "socket-controllers";
    import "./UserController";
    import "./MyMiddleware"; // here we load it
    createKoaServer().listen(3000);
    ```

3. Now we can use our middleware:

    ```typescript
    import {Controller, UseBefore} from "socket-controllers";
    import {MyMiddleware} from "./MyMiddleware";

    @Controller()
    @UseBefore(MyMiddleware)
    export class UserController {

    }
    ```

    or per-action:

    ```typescript
    @Get("/users/:id")
    @UseBefore(MyMiddleware)
    getOne(@Param("id") id: number) {
        // ...
    }
    ```

    This way your middleware will be executed each time before controller action.
    You can use `@UseAfter(MyMiddleware)` to make it execute after each controller action.

### Global middlewares

Same way you created a middleware, you can create a global middleware:

```typescript
import {MiddlewareGlobalBefore, MiddlewareInterface} from "socket-controllers";

@MiddlewareGlobalBefore()
export class CompressionMiddleware implements MiddlewareInterface {

    use(request: any, response: any, next: (err: any) => any): void {
        let compression = require("compression");
        return compression()(request, response, next);
    }

}
```
In this example we simply delegate middleware to compression to use it globally.
Global middleware runs before each request, always.

You can make global middleware to run after controller action by using `@MiddlewareGlobalAfter` instead of `@MiddlewareGlobalBefore`.
 If you have issues with global middlewares run execution order you can set a priority: `@MiddlewareGlobalBefore({ priority: 1 })`.
 Higher priority means middleware being executed earlier.

### Error handlers

Error handlers are specific only to express.
Error handlers works pretty much the same as middlewares, but instead of `@Middleware` decorator `@ErrorHandler` is being used:

1. Create a class that implements a `ErrorHandlerInterface` interface and decorated with `@ErrorHandler` decorator:

    ```typescript
    import {ErrorHandler, ErrorHandlerInterface} from "socket-controllers";

    @ErrorHandler()
    export class CustomErrorHandler implements ErrorHandlerMiddlewareInterface {

        error(error: any, request: any, response: any, next: (err: any) => any) {
            console.log("do something...");
            next();
        }

    }
    ```

2. Load created error handler before app bootstrap:

    ```typescript
    import "reflect-metadata";
    import {createExpressServer} from "socket-controllers";
    import "./UserController";
    import "./CustomErrorHandler"; // here we load it
    createExpressServer().listen(3000);
    ```

## Using interceptors

Interceptors are used to change or replace the data returned to the client.
You can create your own interceptor class or function and use to all or specific controller or controller action.
It works pretty much the same as middlewares.

### Interceptor function

The easiest way is to use functions directly passed to `@UseInterceptor` of the action. 

```typescript
import {Get, Param, UseInterceptor} from "socket-controllers";

// ...

@Get("/users")
@UseInterceptor(function(request: any, response: any, content: any) {
    // here you have content returned by this action. you can replace something 
    // in it and return a replaced result. replaced result will be returned to the user
    return content.replace(/Mike/gi, "Michael");
})
getOne(@Param("id") id: number) {
    return "Hello, I am Mike!"; // client will get a "Hello, I am Michael!" response.
}
```

You can use `@UseInterceptor` per-action, on per-controller. 
If its used per-controller then interceptor will apply to all controller actions.

### Interceptor classes

You can also create a class and use it with `@UseInterceptor` decorator:

```typescript
import {Interceptor, InterceptorInterface} from "socket-controllers";

@Interceptor()
export class NameCorrectionInterceptor implements InterceptorInterface {
    
    intercept(request: any, response: any, content: any) {
        return content.replace(/Mike/gi, "Michael");
    }
    
}
```

And use it in your controllers this way:

```typescript
import {Get, Param, UseInterceptor} from "socket-controllers";
import {NameCorrectionInterceptor} from "./NameCorrectionInterceptor";

// ...

@Get("/users")
@UseInterceptor(NameCorrectionInterceptor)
getOne(@Param("id") id: number) {
    return "Hello, I am Mike!"; // client will get a "Hello, I am Michael!" response.
}
```

### Global interceptors

You can create interceptors that will affect all controllers in your project by creating interceptor class
and mark it with `@InterceptorGlobal` decorator:

```typescript
import {InterceptorGlobal, InterceptorInterface} from "socket-controllers";

@InterceptorGlobal()
export class NameCorrectionInterceptor implements InterceptorInterface {
    
    intercept(request: any, response: any, content: any) {
        return content.replace(/Mike/gi, "Michael");
    }
    
}
```

### Don't forget to load your middlewares, error handlers and interceptors

Middlewares and error handlers should be loaded globally the same way as controllers, before app bootstrap:

```typescript
import "reflect-metadata";
import {createExpressServer} from "socket-controllers";
import "./UserController";
import "./MyMiddleware"; // here we load it
import "./CustomErrorHandler"; // here we load it
import "./BadWordInterceptor"; // here we load it
let app = createExpressServer();
app.listen(3000);
```

Also you can load middlewares from directories. Also you can use glob patterns:

```typescript
import "reflect-metadata";
import {createExpressServer, loadControllers} from "socket-controllers";
createExpressServer({
    controllerDirs: [__dirname + "/controllers/**/*.js"],
    middlewareDirs: [__dirname + "/middlewares/**/*.js"]
}).listen(3000);
```

## Creating instances of classes from action params

When user sends a json object and you are parsing it, sometimes you want to parse it into object of some class,
instead of parsing it into simple literal object.
You have ability to do this using [class-transformer][4].
To use it simply specify a `useConstructorUtils: true` option on application bootstrap:

```typescript
import "reflect-metadata";
import {createExpressServer, useContainer, loadControllers} from "socket-controllers";

createExpressServer({
    useClassTransformer: true
}).listen(3000);
```

Now, when you parse your action params, if you have specified a class, socket-controllers will create you a class
of that instance with the data sent by a user:

```typescript
export class User {
    firstName: string;
    lastName: string;

    getName(): string {
        return this.lastName + " " + this.firstName;
    }
}

@Controller()
export class UserController {

    post(@Body() user: User) {
        console.log("saving user " + user.getName());
    }

}
```

This technique works not only with `@Body`, but also with `@Param`, `@QueryParam`, `@BodyParam` and other decorators.
Learn more about class-transformer and how to handle more complex object constructions [here][4].
This behaviour is enabled by default.
If you want to disable it simply pass `useConstructorUtils: false` to createExpressServer method.

## Default error handling

Routing-controller comes with default error handling mechanism.

## Using DI container

`socket-controllers` supports a DI container out of the box. You can inject your services into your controllers,
middlewares and error handlers. Container must be setup during application bootstrap.
Here is example how to integrate socket-controllers with [typedi](https://github.com/pleerock/typedi):

```typescript
import "reflect-metadata";
import {createExpressServer, useContainer} from "socket-controllers";
import {Container} from "typedi";

// its important to set container before any operation you do with socket-controllers,
// including importing controllers
useContainer(Container);

// create and run server
createExpressServer({
    controllerDirs: [__dirname + "/controllers/*.js"],
    middlewareDirs: [__dirname + "/middlewares/*.js"],
    interceptorDirs: [__dirname + "/interceptor/*.js"],
}).listen(3000);
```

That's it, now you can inject your services into your controllers:

```typescript
@Controller()
export class UsersController {

    constructor(private userRepository: UserRepository) {
    }

    // ... controller actions

}
```

## Decorators Reference

| Signature                                                                    | Example                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@Controller(baseRoute: string)`                                             | `@Controller("/users") class SomeController`         | Class that is marked with this decorator is registered as controller and its annotated methods are registered as actions. Base route is used to concatenate it to all controller action routes.                                                                                                                                                                                                                                                     |
| `@Get(route: string|RegExp)`                                                 | `@Get("/users") all()`                               | Methods marked with this decorator will register a request made with GET HTTP Method to a given route. In action options you can specify if action should response json or regular text response.                 
| `@Post(route: string|RegExp)`                                                | `@Post("/users") save()`                             | Methods marked with this decorator will register a request made with POST HTTP Method to a given route. In action options you can specify if action should response json or regular text response.                
| `@Put(route: string|RegExp)`                                                 | `@Put("/users/:id") update()`                        | Methods marked with this decorator will register a request made with PUT HTTP Method to a given route. In action options you can specify if action should response json or regular text response.                 
| `@Patch(route: string|RegExp)`                                               | `@Patch("/users/:id") patch()`                       | Methods marked with this decorator will register a request made with PATCH HTTP Method to a given route. In action options you can specify if action should response json or regular text response.               
| `@Delete(route: string|RegExp)`                                              | `@Delete("/users/:id") delete()`                     | Methods marked with this decorator will register a request made with DELETE HTTP Method to a given route. In action options you can specify if action should response json or regular text response.              
| `@Head(route: string|RegExp)`                                                | `@Head("/users/:id") head()`                         | Methods marked with this decorator will register a request made with HEAD HTTP Method to a given route. In action options you can specify if action should response json or regular text response.                
| `@Options(route: string|RegExp)`                                             | `@Options("/users/:id") head()`                      | Methods marked with this decorator will register a request made with OPTIONS HTTP Method to a given route. In action options you can specify if action should response json or regular text response.             
| `@Method(methodName: string, route: string|RegExp)`                          | `@Method("move", "/users/:id") move()`               | Methods marked with this decorator will register a request made with given `methodName` HTTP Method to a given route. In action options you can specify if action should response json or regular text response.  

## Samples

* Take a look on [socket-controllers with angular 2](https://github.com/pleerock/socket-controllers-angular2-demo) which is using socket-controllers.
* Take a look on samples in [./sample](https://github.com/pleerock/socket-controllers/tree/master/sample) for more examples
of usage.

## Related projects

* If you are interested to create controller-based express or koa server use [routing-controllers](https://github.com/pleerock/routing-controllers) module.
* If you need to use dependency injection in use [typedi](https://github.com/pleerock/typedi) module.

[1]: http://expressjs.com/
[2]: http://koajs.com/
[3]: https://github.com/expressjs/multer
[4]: https://github.com/pleerock/class-transformer
