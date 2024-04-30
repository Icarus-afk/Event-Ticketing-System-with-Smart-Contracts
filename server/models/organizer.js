import mongoose from "mongoose";
import validator from 'validator';


const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 500
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    website: {
        type: String,
        trim: true,
        validate: [validator.isURL, 'Please provide a valid URL']
    },
    customLinks: [{
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 30
        },
        url: {
            type: String,
            trim: true,
            required: true,
            validate: [validator.isURL, 'Please provide a valid URL']
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },

});

OrganizationSchema.pre('updateOne', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;