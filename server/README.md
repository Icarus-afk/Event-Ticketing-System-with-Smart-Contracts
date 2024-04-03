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


## File Structure

The server directory is structured as follows:

```bash
npm start   
```
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
