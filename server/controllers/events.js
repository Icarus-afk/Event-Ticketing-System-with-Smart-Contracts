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
// import { handleImageUpload } from "../utils/imageHandler.js";

dotenv.config()


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const web3Instance = new Web3('http://localhost:7545');
const contractABI = contractData.abi;
const contractAddress = '0x914a5DB53877D3f4A0F0F664Ce3264F3800D4B4B';
const EventManagementContract = new web3Instance.eth.Contract(contractABI, contractAddress);


export const createEvent = async (req, res) => {
    try {
        const io = getIo();

        logger.info('Creating event...');
        const { name, date, time, price, totalTickets, location, description, attendees, tags } = req.body;
        const image = req.file;

        if (!req.userId) {
            logger.info('User not authenticated');
            return res.status(401).json({ success: false, message: 'User not authenticated', statusCode: 401 });
        }

        if (!totalTickets) {
            logger.info('Total tickets is required');
            return res.status(400).json({ success: false, message: 'Total tickets is required', statusCode: 400 });
        }

        const wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) {
            logger.info('User wallet not found');
            return res.status(404).json({ success: false, message: 'User wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;
        const organizerUser = await User.findById(wallet.userId);

        if (!organizerUser) {
            logger.info('Organizer not found');
            return res.status(404).json({ success: false, message: 'Organizer not found', statusCode: 404 });
        }

        const balance = await web3Instance.eth.getBalance(organizer);
        if (web3Instance.utils.fromWei(balance, 'ether') < price) {
            logger.info('Organizer\'s account does not have enough Ether');
            return res.status(400).json({ success: false, message: 'Organizer\'s account does not have enough Ether', statusCode: 400 });
        }
        if (!wallet.iv) {
            logger.info('Initialization vector is undefined');
            return res.status(500).json({ success: false, message: 'Initialization vector is undefined', statusCode: 500 });
        }
        const existingEvent = await Event.findOne({ name, organizer: organizerUser._id });
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
            organizer: organizerUser._id,
            eventId: (await EventManagementContract.methods.getTotalEvents().call()) - BigInt(1),
            location,
            description,
            attendees,
            tags,
            image: image ? image.path : null, 
        });

        await event.save();
        logger.info('Event created successfully');
        io.emit('newEvent', event);
        event._doc.image = image ? `${req.protocol}://${req.get('host')}/${event.image}` : null;
        res.status(201).json({ success: true, message: 'Event created successfully', data: event, statusCode: 201 });
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
        const user = await User.findById(req.userId);
        if (!user) {
            logger.info('User not found');
            return res.status(404).json({ success: false, message: 'User not found', statusCode: 404 });
        }

        const wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) {
            logger.info('User wallet not found');
            return res.status(404).json({ success: false, message: 'User wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;
        const organizerUser = await User.findById(wallet.userId);

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
            const event = await Event.findOneAndUpdate({ eventId }, {
                name,
                date,
                time,
                price,
                totalTickets,
                organizerUser,
                eventId,
                location,
                description,
                tags,
                image
            }, { new: true }); 

            res.status(200).json({ success: true, message: 'Event updated successfully', event, statusCode: 200 });
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

        const user = await User.findById(req.userId);
        if (!user) {
            logger.info('User not found');
            return res.status(404).json({ success: false, message: 'User not found', statusCode: 404 });
        }

        const wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) {
            logger.info('User wallet not found');
            return res.status(404).json({ success: false, message: 'User wallet not found', statusCode: 404 });
        }

        const organizer = wallet.address;
        if (!organizer) {
            logger.info('User wallet address is undefined');
            return res.status(500).json({ success: false, message: 'User wallet address is undefined', statusCode: 500 });
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

        const gas = await deleteEvent.estimateGas({ from: organizer });

        const tx = {
            to: EventManagementContract.options.address,
            data: deleteEvent.encodeABI(),
            gas,
            gasPrice: web3Instance.utils.toWei('2', 'gwei'),
            nonce: await web3Instance.eth.getTransactionCount(organizer)
        };

        const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
        await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);

        const event = await Event.findOne({ eventId });
        if (!event) {
            logger.info('Event not found');
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        await Event.deleteOne({ eventId });

        logger.info('Event deleted successfully');
        res.status(200).json({ success: true, message: 'Event deleted successfully', statusCode: 200 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the event', statusCode: 500 });
    }
};


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

        const events = await Event.find(queryObject).sort({date: sortOrder}).skip(skip).limit(limit);

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