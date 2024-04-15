// testClientSocket.js
import io from 'socket.io-client';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFobWVkLmVoc2FuMTRAZ21haWwuY29tIiwiaWQiOiI2NjEyNjAwMTBiODcyOTNhN2U5NTU2MWEiLCJpYXQiOjE3MTMxNDcwNTcsImV4cCI6MTcxMzE1MDY1N30.zUkb1DiCC9dxrLoQTjGT300A_O-R8584htASfLBryxg"

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