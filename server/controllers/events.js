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
import { v4 as uuidv4 } from 'uuid';

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
        const { name, date, time, price, totalTickets } = req.body;

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
        if (!organizer) {
            logger.info('User wallet address is undefined');
            return res.status(500).json({ success: false, message: 'User wallet address is undefined', statusCode: 500 });
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
        const existingEvent = await Event.findOne({ name, organizer });
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
            totalTickets
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

        const eventId = uuidv4();

        const event = new Event({
            name,
            date,
            time,
            price,
            totalTickets,
            organizer,
            eventId
        });

        await event.save();

        logger.info('Event created successfully');
        io.emit('newEvent', event);
        res.status(201).json({ success: true, message: 'Event created successfully', data: event, statusCode: 201 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the event', statusCode: 500 });
    }
};


export const updateEvent = async (req, res) => {
    try {
        logger.info('Updating event...');
        const { eventId } = req.params;
        const { name, date, time, price, totalTickets } = req.body;

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

        const eventDate = new Date(`${date}T00:00`);
        const dateTimestamp = Math.floor(eventDate.getTime() / 1000);

        const timeParts = time.split(':');
        const timeInSeconds = (+timeParts[0]) * 60 * 60 + (+timeParts[1]) * 60;

        const updateEvent = EventManagementContract.methods.updateEvent(eventId, name, dateTimestamp, timeInSeconds, web3Instance.utils.toWei(price, 'ether'), totalTickets);

        const gas = await updateEvent.estimateGas({ from: organizer });

        const tx = {
            to: EventManagementContract.options.address,
            data: updateEvent.encodeABI(),
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

        event.name = name;
        event.date = date;
        event.time = time;
        event.price = price;
        event.totalTickets = totalTickets;
        await event.save();

        logger.info('Event updated successfully');
        res.status(200).json({ success: true, message: 'Event updated successfully', data: event, statusCode: 200 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the event', statusCode: 500 });
    }
};


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


export const getEvents = async (req, res) => {
    try {
        logger.info('Getting events...');

        const { name, date, time, price, totalTickets, organizer, eventId } = req.query;

        let queryObject = {};
        if (name) queryObject.name = name;
        if (date) queryObject.date = date;
        if (time) queryObject.time = time;
        if (price) queryObject.price = price;
        if (totalTickets) queryObject.totalTickets = totalTickets;
        if (organizer) queryObject.organizer = organizer;
        if (eventId) queryObject.eventId = eventId;

        const events = await Event.find(queryObject);

        logger.info('Events retrieved successfully');
        res.status(200).json({ success: true, data: events, statusCode: 200 });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while getting the events', statusCode: 500 });
    }
};