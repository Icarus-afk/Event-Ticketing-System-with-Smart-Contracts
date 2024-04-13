// testClientSocket.js
import io from 'socket.io-client';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFobWVkLmVoc2FuMjNAZ21haWwuY29tIiwiaWQiOiI2NjFhZjNkYmY2MDI2NzYxY2I4NDFiMWEiLCJpYXQiOjE3MTMwNDIzOTYsImV4cCI6MTcxMzA0NTk5Nn0.PhWxxCjiyf7p5TR7qEHLIdJh8qZPm4l65F5HdolJELs"

const socket = io.connect('http://localhost:8000', {
    query: { token }
});

socket.on('connect', () => {
    console.log('Successfully connected to the server');
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error.message);
});

socket.on('newEvent', (event) => {
    console.log('New event created:', event);
});