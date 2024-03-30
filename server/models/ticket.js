import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isTransferred: {
        type: Boolean,
        default: false
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    transferredAt: {
        type: Date
    }
}, {
    timestamps: true
});

ticketSchema.pre('save', function(next) {
    if (this.isModified('isTransferred') && this.isTransferred) {
        this.transferredAt = Date.now();
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;