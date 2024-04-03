# Server Documentation

This documentation provides an overview of the server-side codebase for the ticketing system.

## Table of Contents

- [Getting Started](#getting-started)
- [File Structure](#file-structure)
- [Key Files](#key-files)
- [APIs](#apis)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Synchronization](#synchronization)

## Getting Started

To start the server, navigate to the server directory and run the following command:

install pm2 in your server:

```
npm install pm2 -g
```

start the server with:

```bash
pm2 start index.js
```

To check the status of your application:

```bash
pm2 list
```

To restart your application:

```bash
pm2 restart index.js
```

to stop the application:

```bash
pm2 stop index.js
```

to delete the application from pm2's process list:

```bash
pm2 delete index.js
```

## File Structure

The server directory is structured as follows:

```bash
server/
├── .env
├── app.js
├── controllers/
│   ├── events.js
│   ├── tickets.js
│   └── users.js
├── db.js
├── index.js
├── logs/
│   ├── access.log
│   └── error.log
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── validator.js
├── models/
│   ├── Event.js
│   ├── Ticket.js
│   ├── User.js
│   └── Wallet.js
├── package.json
├── routes/
│   ├── events.js
│   ├── tickets.js
│   └── users.js
└── synchronizer.js
```

## Key Files

- **app.js**: This is the main application file. It sets up the express server, applies middleware, and defines the routes.
- **controllers/events.js**: This file contains the controller functions for event-related endpoints.
- **controllers/ticket.js**: This file contains the controller functions for ticket-related endpoints.
- **synchronizer.js**: This file contains a cron job that synchronizes balances.

## APIs

The server exposes the following APIs:

- **User Routes**: Handled by `userRoutes` in `app.js`.
- **Event Routes**: Handled by `eventRoutes` in `app.js`.
- **Ticket Routes**: Handled by `ticketRoutes` in `app.js`.

## Database Models

The server uses Mongoose for object modeling. The models used are:

- **Event**: Represents an event in the system.
- **User**: Represents a user in the system.
- **Wallet**: Represents a user's wallet.
- **Ticket**: Represents a ticket for an event.

## Middleware

The server uses several middleware functions:

- **errorHandler**: Handles errors and sends appropriate responses.
- **logger**: Logs request details.
- **limiter**: Limits the rate of incoming requests.

## Synchronization

The server uses a cron job to synchronize balances. This is done in `synchronizer.js`. A script that synchronizes data with the Ethereum blockchain.


## Future Works

- [ ✓ ] Implement Authentication: Implement user authentication using JWT or Passport.js to secure the routes.
- [ ] **Add Tests**: Write unit and integration tests for the routes and models using a testing framework like Jest.
- [ ] **Improve Error Handling**: Enhance the errorHandler middleware to handle more specific error cases.
- [ ✓ ] **Add Data Validation**: Use a library like Joi to validate incoming request data.
- [ ] **Implement Caching**: Use Redis to cache responses and improve performance.
- [ ] **Add More Models**: Depending on the application's needs, more models could be added (e.g., Admin, Category).
- [ ] **Implement Pagination**: Add pagination to the routes that return multiple items.
- [ ✓ ] **Use a Process Manager**: Use a process manager like PM2 for better process management.
- [ ] **Dockerize the Application**: Containerize the application using Docker for easier deployment.


