import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalTickets: {
        type: Number,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        unique: true,
        required: true
    }
});

export default mongoose.model('Event', eventSchema);