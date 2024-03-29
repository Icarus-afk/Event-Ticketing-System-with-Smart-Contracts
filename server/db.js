import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_STRING = process.env.MONGO_STRING;

const connectDB = async () => {
    try {
        await mongoose.connect(String(MONGO_STRING));
        console.log('Database connected successfully');
    } catch (error) {
        console.log(`Error Occured ---> ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;