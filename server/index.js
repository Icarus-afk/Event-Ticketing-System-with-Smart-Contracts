import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';
import { createServer } from 'http';
import { initSocket } from './utils/initSocket.js'; // adjust the path according to your project structure

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    const server = createServer(app);
    initSocket(server);
    server.listen(PORT, () => console.log(`Server running on port = ${PORT}`));
});