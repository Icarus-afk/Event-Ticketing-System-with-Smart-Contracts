import mongoose from "mongoose";

const { Schema } = mongoose;

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
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
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    eventId: {
        type: String,
        unique: true,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String
    }],
    image: [{
        type: String
    }]
});

export default mongoose.model('Event', eventSchema);