import Event from '../models/event.js';
import User from '../models/user.js';
import Wallet from '../models/wallet.js';
import Web3 from 'web3';
import contractData from '../../smart_contracts/build/contracts/EventManagement.json' assert { type: 'json' };
import moment from 'moment';
import dotenv from 'dotenv'
import crypto from 'crypto';
import logger from '../utils/consoleLogger.js'
import { getIo } from '../utils/initSocket.js';
import { initContract } from '../utils/initContract.js';
import Organization from '../models/organizer.js';
// import { handleImageUpload } from "../utils/imageHandler.js";

dotenv.config()


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const { web3Instance, contract: EventManagementContract } = initContract('http://localhost:7545', contractData.abi, process.env.EVENT_BLOCK);


export const createEvent = async (req, res) => {
    try {
        const io = getIo();


        logger.info('Creating event...');
        const { name, date, time, price, totalTickets, location, description, attendees, tags } = req.body;
        const { organizationId } = req.params;
        const image = req.file;

        console.log(organizationId)
        if (!organizationId) {
            logger.info('Organization ID not provided');
            return res.status(400).json({ success: false, message: 'Organization ID not provided', statusCode: 400 });
        }

        if (!totalTickets) {
            logger.info('Total tickets is required');
            return res.status(400).json({ success: false, message: 'Total tickets is required', statusCode: 400 });
        }

        const organization = await Organization.findById({ _id: organizationId });
        if (!organization) {
            logger.info('Organization not found');
            return res.status(404).json({ success: false, message: 'Organization not found', statusCode: 404 });
        }

        const wallet = await Wallet.findOne({ organizationId: organization._id });
        if (!wallet) {
            logger.info('Organization wallet not found');
            return res.status(404).json({ success: false, message: 'Organization wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;

        const balance = await web3Instance.eth.getBalance(organizer);
        if (web3Instance.utils.fromWei(balance, 'ether') < price) {
            logger.info('Organizer\'s account does not have enough Ether');
            return res.status(400).json({ success: false, message: 'Organizer\'s account does not have enough Ether', statusCode: 400 });
        }

        if (!wallet.iv) {
            logger.info('Initialization vector is undefined');
            return res.status(400).json({ success: false, message: 'Initialization vector is undefined', statusCode: 400 });
        }
        const existingEvent = await Event.findOne({ name, organizer: organization._id });
        if (existingEvent) {
            logger.info('Event with this name already exists for this organizer');
            return res.status(400).json({ success: false, message: 'Event with this name already exists for this organizer', statusCode: 400 });
        }
        const dateTimestamp = moment(date, 'YYYY-MM-DD').unix();
        const timeTimestamp = moment(time, 'HH:mm').unix();

        const createEvent = EventManagementContract.methods.createEvent(
            name,
            dateTimestamp,
            timeTimestamp,
            web3Instance.utils.toWei(price, 'ether'),
            totalTickets,
        );

        const gas = await createEvent.estimateGas({ from: organizer });

        const decipher = crypto.createDecipheriv('aes-256-ctr', ENCRYPTION_KEY, Buffer.from(wallet.iv, 'hex'));
        let decryptedPrivateKey = decipher.update(wallet.privateKey, 'hex', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        const tx = {
            to: EventManagementContract.options.address,
            data: createEvent.encodeABI(),
            gas,
            gasPrice: web3Instance.utils.toWei('2', 'gwei'),
            nonce: await web3Instance.eth.getTransactionCount(organizer)
        };

        const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
        await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);

        const event = new Event({
            name,
            date,
            time,
            price,
            totalTickets,
            organizer: organization._id,
            eventId: (await EventManagementContract.methods.getTotalEvents().call()) - BigInt(1),
            location,
            description,
            attendees,
            tags,
            image: image ? image.path : null,
        });

        await event.save();
        const populatedEvent = await Event.findById(event._id).populate({
            path: 'organizer',
            select: '-password -__v'
        });

        logger.info('Event created successfully');
        io.emit('newEvent', populatedEvent);
        populatedEvent._doc.image = image ? `${req.protocol}://${req.get('host')}/${populatedEvent.image}` : null;
        res.status(201).json({ success: true, message: 'Event created successfully', data: populatedEvent, statusCode: 201 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the event', statusCode: 500 });
    }
};



export const updateEvent = async (req, res) => {
    try {
        logger.info('Updating event...');
        const { name, date, time, price, totalTickets, location, description, tags, image } = req.body;
        const { eventId } = req.params;

        const eventDate = new Date(`${date}T00:00`);
        const dateTimestamp = Math.floor(eventDate.getTime() / 1000);

        const eventIdNumber = parseInt(eventId, 10);

        const event = await Event.findOne({eventId: eventIdNumber});

        console.log("Event", eventIdNumber)
        if (!event) {
            logger.info('Event not found');
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        // Use the organizer's ID to find the wallet
        const wallet = await Wallet.findOne({ organizationId: event.organizer._id });
        console.log("Wallet", wallet)
        if (!wallet) {
            logger.info('Organizer wallet not found');
            return res.status(404).json({ success: false, message: 'Organizer wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;
        const organizerUser = await Organization.findById(wallet.organizationId);

        if (!organizerUser) {
            logger.info('Organizer not found');
            return res.status(404).json({ success: false, message: 'Organizer not found', statusCode: 404 });
        }

        logger.info(`Organizer's wallet address: ${organizer}`);

        if (!wallet.iv) {
            logger.info('Initialization vector is undefined');
            return res.status(500).json({ success: false, message: 'Initialization vector is undefined', statusCode: 500 });
        }

        const decipher = crypto.createDecipheriv('aes-256-ctr', ENCRYPTION_KEY, Buffer.from(wallet.iv, 'hex'));
        let decryptedPrivateKey = decipher.update(wallet.privateKey, 'hex', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        const timeParts = time.split(':');
        const timeInSeconds = (+timeParts[0]) * 60 * 60 + (+timeParts[1]) * 60;

        const eventDetails = await EventManagementContract.methods.getEventDetails(eventIdNumber).call();
        if (eventDetails.organizer !== organizer) {
            logger.info('User is not the organizer of this event');
            return res.status(403).json({ success: false, message: 'User is not the organizer of this event', statusCode: 403 });
        }

        const updateEvent = EventManagementContract.methods.updateEvent(eventIdNumber, name, dateTimestamp, timeInSeconds, web3Instance.utils.toWei(price, 'ether'), totalTickets);

        let gas;
        try {
            gas = await updateEvent.estimateGas({ from: organizer });
        } catch (error) {
            logger.error('Error estimating gas:', error);
            gas = 21000;
        }
        const tx = {
            to: EventManagementContract.options.address,
            data: updateEvent.encodeABI(),
            gas,
            gasPrice: web3Instance.utils.toWei('2', 'gwei'),
            nonce: await web3Instance.eth.getTransactionCount(organizer),
            from: organizer
        };

        try {
            const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
            await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        } catch (error) {
            logger.error('Error updating event in smart contract:', error);
            return res.status(500).json({ message: 'Error updating event in smart contract', error });
        }
        try {
            const updatedEvent = await Event.findOneAndUpdate({ eventId }, {
                name,
                date,
                time,
                price,
                totalTickets,
                organizer: organizerUser._id,
                eventId,
                location,
                description,
                tags,
                image
            }, { new: true }).populate({
                path: 'organizer',
                select: '-password -__v'
            });

            res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent, statusCode: 200 });
        } catch (error) {
            logger.error('Error updating event in MongoDB:', error);
            res.status(500).json({ success: false, message: 'Error updating event', statusCode: 500 });
        }
    } catch (error) {
        logger.error('Error updating event', error);
        res.status(500).json({ success: false, message: 'Error updating event', statusCode: 500 });
    }
}



export const deleteEvent = async (req, res) => {
    try {
        logger.info('Deleting event...');
        const { eventId } = req.params;

        const event = await Event.findOne({eventId: eventId});

        if (!event) {
            logger.info('Event not found');
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        // Use the organizer's ID to find the wallet
        const wallet = await Wallet.findOne({ organizationId: event.organizer._id });

        if (!wallet) {
            logger.info('Organizer wallet not found');
            return res.status(404).json({ success: false, message: 'Organizer wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;
        const organizerUser = await Organization.findById(wallet.organizationId);

        if (!organizerUser) {
            logger.info('Organizer not found');
            return res.status(404).json({ success: false, message: 'Organizer not found', statusCode: 404 });
        }

        logger.info(`Organizer's wallet address: ${organizer}`);

        if (!wallet.iv) {
            logger.info('Initialization vector is undefined');
            return res.status(500).json({ success: false, message: 'Initialization vector is undefined', statusCode: 500 });
        }

        const decipher = crypto.createDecipheriv('aes-256-ctr', ENCRYPTION_KEY, Buffer.from(wallet.iv, 'hex'));
        let decryptedPrivateKey = decipher.update(wallet.privateKey, 'hex', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        const deleteEvent = EventManagementContract.methods.deleteEvent(eventId);

        let gas;
        try {
            gas = await deleteEvent.estimateGas({ from: organizer });
        } catch (error) {
            logger.error('Error estimating gas:', error);
            gas = 21000;
        }
        const tx = {
            to: EventManagementContract.options.address,
            data: deleteEvent.encodeABI(),
            gas,
            gasPrice: web3Instance.utils.toWei('2', 'gwei'),
            nonce: await web3Instance.eth.getTransactionCount(organizer),
            from: organizer
        };

        try {
            const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
            await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        } catch (error) {
            logger.error('Error deleting event in smart contract:', error);
            return res.status(500).json({ message: 'Error deleting event in smart contract', error });
        }
        try {
            await Event.findOneAndDelete({ eventId });

            res.status(200).json({ success: true, message: 'Event deleted successfully', statusCode: 200 });
        } catch (error) {
            logger.error('Error deleting event in MongoDB:', error);
            res.status(500).json({ success: false, message: 'Error deleting event', statusCode: 500 });
        }
    } catch (error) {
        logger.error('Error deleting event', error);
        res.status(500).json({ success: false, message: 'Error deleting event', statusCode: 500 });
    }
}


// export const getEvents = async (req, res) => {
//     try {
//         logger.info('Getting events...');

//         const { name, date, time, price, totalTickets, organizer, eventId, page = 1, limit = 10 } = req.query;

//         let queryObject = {};
//         if (name) queryObject.name = name;
//         if (date) queryObject.date = date;
//         if (time) queryObject.time = time;
//         if (price) queryObject.price = price;
//         if (totalTickets) queryObject.totalTickets = totalTickets;
//         if (organizer) queryObject.organizer = organizer;
//         if (eventId) queryObject.eventId = eventId;

//         const cacheKey = JSON.stringify(queryObject);

//         // When retrieving data from Redis
//         const cacheResult = await redisClient.zrangebyscore(cacheKey, page, page);
//         if (cacheResult.length > 0) {
//             const dataFromCache = JSON.parse(cacheResult[0]);
//             logger.info('Events retrieved from cache');
//             return res.status(200).json({
//                 success: true,
//                 data: dataFromCache.events,
//                 currentPage: dataFromCache.currentPage,
//                 totalPages: dataFromCache.totalPages,
//                 totalRecords: dataFromCache.totalRecords,
//                 statusCode: 200
//             });
//         }

//         const totalRecords = await Event.countDocuments(queryObject);
//         const totalPages = Math.ceil(totalRecords / limit);
//         const skip = (page - 1) * limit;

//         const events = await Event.find(queryObject).skip(skip).limit(limit);

//         const dataToCache = {
//             events,
//             currentPage: page,
//             totalPages,
//             totalRecords,
//         };
//         await redisClient.zadd(cacheKey, page, JSON.stringify(dataToCache));

//         logger.info('Events retrieved from database');
//         res.status(200).json({ success: true, data: events, currentPage: page, totalPages, totalRecords, statusCode: 200 });
//     } catch (error) {
//         logger.error(error);
//         res.status(500).json({ success: false, message: 'An error occurred while getting the events', statusCode: 500 });
//     }
// };


export const getEvents = async (req, res) => {
    try {
        logger.info('Getting events...');

        const { name, date, time, price, totalTickets, organizer, eventId, page = 1, limit = 6, sort = 'desc' } = req.query;

        let queryObject = {};
        if (name) queryObject.name = { $regex: new RegExp(name), $options: 'i' };
        if (date) queryObject.date = date;
        if (time) queryObject.time = time;
        if (price) queryObject.price = price;
        if (totalTickets) queryObject.totalTickets = totalTickets;
        if (organizer) queryObject.organizer = organizer;
        if (eventId) queryObject.eventId = eventId;

        const totalRecords = await Event.countDocuments(queryObject);
        const totalPages = Math.ceil(totalRecords / limit);
        const skip = (page - 1) * limit;

        const sortOrder = sort === 'desc' ? -1 : 1;

        const events = await Event.find(queryObject)
            .populate({
                path: 'organizer',
                select: '-password -__v',
            })
            .sort({ date: sortOrder })
            .skip(skip)
            .limit(limit);
        const updatedEvents = events.map(event => {
            const imageUrl = event.image ? `${req.protocol}://${req.get('host')}/${event.image}` : null;
            return { ...event._doc, image: imageUrl };
        });

        logger.info('Events retrieved from database');
        res.status(200).json({ success: true, data: updatedEvents, currentPage: page, totalPages, totalRecords, statusCode: 200 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while getting the events', statusCode: 500 });
    }
};