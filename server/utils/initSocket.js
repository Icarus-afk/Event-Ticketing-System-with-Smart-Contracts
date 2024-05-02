import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from './consoleLogger.js'
import cookie from 'cookie';

dotenv.config();

let io;

const initSocket = (server) => {
    io = new Server(server);

    io.use((socket, next) => {
        if (socket.request.headers && socket.request.headers.cookie){
            const cookies = cookie.parse(socket.request.headers.cookie);
            const token = cookies.yourCookieName;

            jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }    
    }).on('connection', (socket) => {
        logger.info('New client connected');

        socket.on('message', (data) => {
            logger.info('Received message:', data);
        });

        socket.on('disconnect', () => {
            logger.info('Client disconnected');
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export { initSocket, getIo };