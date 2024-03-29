import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port = ${PORT}`));
});