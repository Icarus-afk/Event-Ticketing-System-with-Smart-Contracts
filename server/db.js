import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/consoleLogger.js';

dotenv.config();

const MONGO_STRING = process.env.MONGO_STRING;

const connectDB = async () => {
    try {
        await mongoose.connect(String(MONGO_STRING));
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error(`Error Occured ---> ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;