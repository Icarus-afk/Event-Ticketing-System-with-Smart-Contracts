import dotenv from 'dotenv';
import crypto from 'crypto';
import Web3 from 'web3';
import contractData from '../../smart_contracts/build/contracts/Ticket.json' assert { type: 'json' };
import Ticket from '../models/ticket.js';
import Wallet from '../models/wallet.js';
import Event from '../models/event.js';
import User from "../models/user.js";
import jwt from 'jsonwebtoken'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const web3Instance = new Web3('http://localhost:7545');
const contractABI = contractData.abi;
const contractAddress = '0x4dFFE195b61e03E14d11450D9C6c05Dd02343F25';
const TicketContract = new web3Instance.eth.Contract(contractABI, contractAddress);


export const issueTicket = async (req, res) => {
    try {
        console.log('Issuing ticket...');
        const { eventId } = req.body;

        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated', statusCode: 401 });
        }

        const wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'User wallet not found', statusCode: 404 });
        }
        console.log(wallet.address)
        const from = wallet.address;
        if (!from) {
            return res.status(400).json({ success: false, message: 'Wallet address not found', statusCode: 400 });
        }

        const event = await Event.findOne({ eventId: eventId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        const totalTickets = event.totalTickets;
        const ticketsSold = await Ticket.countDocuments({ eventId: event._id });

        if (ticketsSold >= totalTickets) {
            return res.status(400).json({ success: false, message: 'No more tickets available for this event', statusCode: 400 });
        }

        const hasTicket = await TicketContract.methods.getTicketDetails(from, eventId).call();
        if (hasTicket) {
            return res.status(400).json({ success: false, message: 'Ticket already issued to this address for the event', statusCode: 400 });
        }

        const decipher = crypto.createDecipheriv('aes-256-ctr', ENCRYPTION_KEY, Buffer.from(wallet.iv, 'hex'));
        let decryptedPrivateKey = decipher.update(wallet.privateKey, 'hex', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        const nonce = await web3Instance.eth.getTransactionCount(from);

        const tx = {
            'nonce': nonce,
            'to': contractAddress,
            'gasPrice': web3Instance.utils.toHex(20 * 1e9), // 20 Gwei
            'gasLimit': web3Instance.utils.toHex(210000), // gas limit
            'data': TicketContract.methods.issueTicket(from, eventId).encodeABI()
        };

        const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
        const receipt = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction hash: ${receipt.transactionHash}`);

        const ticket = new Ticket({
            eventId: event._id,
            owner: req.userId,
            isTransferred: false
        });
        await ticket.save();

        return res.status(200).json({ success: true, message: 'Ticket issued successfully', statusCode: 200 });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};

export const getTotalTicketsSold = async (req, res) => {
    try {
        console.log('Getting total tickets...');
        const eventId = req.params.eventId;

        const event = await Event.findOne({ eventId: eventId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        const totalTickets = await Ticket.countDocuments({ eventId: event._id });

        return res.status(200).json({ success: true, totalTickets, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};
dotenv.config();

export const getTicketsTransfarred = async (req, res) => {
    try {
        console.log('Getting tickets sold...');
        const { eventId } = req.params;

        const ticketsSold = await Ticket.countDocuments({ eventId, isTransferred: true });

        return res.status(200).json({ success: true, ticketsSold, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};

export const transferTicket = async (req, res) => {
    try {
        console.log('Transferring ticket...');
        const { to, ticketId } = req.body;  // Extract ticketId from the request body

        const fromWallet = await Wallet.findOne({ userId: req.userId });
        if (!fromWallet) {
            return res.status(404).json({ success: false, message: 'Sender wallet not found', statusCode: 404 });
        }

        const recipientUser = await User.findOne({ email: to });
        if (!recipientUser) {
            return res.status(404).json({ success: false, message: 'Recipient user not found', statusCode: 404 });
        }

        const toWallet = await Wallet.findOne({ userId: recipientUser._id });
        if (!toWallet) {
            return res.status(404).json({ success: false, message: 'Recipient wallet not found', statusCode: 404 });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found', statusCode: 404 });
        }


        const eventObjectId = ticket.eventId;
        const event = await Event.findById(eventObjectId);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        const eventId = event.eventId;

        const decipher = crypto.createDecipheriv('aes-256-ctr', ENCRYPTION_KEY, Buffer.from(fromWallet.iv, 'hex'));
        let decryptedPrivateKey = decipher.update(fromWallet.privateKey, 'hex', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        const nonce = await web3Instance.eth.getTransactionCount(fromWallet.address);

        const tx = {
            'nonce': nonce,
            'to': contractAddress,
            'gasPrice': web3Instance.utils.toHex(20 * 1e9),
            'gasLimit': web3Instance.utils.toHex(210000),
            'data': TicketContract.methods.transferTicket(toWallet.address, eventId).encodeABI()
        };
        const signedTx = await web3Instance.eth.accounts.signTransaction(tx, decryptedPrivateKey);
        const receipt = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
 
        const newOwner = await User.findOne({ email: req.body.to });
        if (!newOwner) {
            return res.status(404).json({ success: false, message: 'New owner not found', statusCode: 404 });
        }

        ticket.owner = newOwner._id;
        await ticket.save();

        return res.status(200).json({ success: true, message: 'Ticket transferred successfully', ticket, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Something went wrong, Contact the Admin for further details', statusCode: 500 });
    }
};

export const getTicketDetails = async (req, res) => {
    try {
        console.log('Getting ticket details...');
        const eventId = req.params.eventId;
        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const ownerId = decoded.id;

        const event = await Event.findOne({ eventId: eventId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found', statusCode: 404 });
        }

        const ticket = await Ticket.findOne({ owner: ownerId, eventId: event._id })
            .populate('owner', '-password')
            .populate('eventId');

        const hasTicket = !!ticket;

        return res.status(200).json({ success: true, hasTicket, ticket, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};