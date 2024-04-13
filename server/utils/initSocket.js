// initSocket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

let io;

const initSocket = (server) => {
    io = new Server(server);

    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token){
            jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }    
    }).on('connection', (socket) => {
        console.log('New client connected');

        socket.on('message', (data) => {
            console.log('Received message:', data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
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