import dotenv from 'dotenv';
import Web3 from 'web3';
import contractData from '../../smart_contracts/build/contracts/Ticket.json' assert { type: 'json' };
import Ticket from '../models/ticket.js';
import Wallet from '../models/wallet.js'; // replace with the path to your Wallet model


dotenv.config();

const web3Instance = new Web3('http://localhost:7545');

const contractABI = contractData.abi;
const contractAddress = '0x8e65142C2aA1F74CC95d4a32B84754e4DC609D57'; 
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

        const from = wallet.address;
        if (!from) {
            return res.status(400).json({ success: false, message: 'Wallet address not found', statusCode: 400 });
        }

        const gasPrice = await web3Instance.eth.getGasPrice();
        const gasEstimate = await TicketContract.methods.issueTicket(from, eventId).estimateGas({ from });

        const receipt = await TicketContract.methods.issueTicket(from, eventId).send({ from, gasPrice, gas: gasEstimate });

        const ticket = new Ticket({
            eventId,
            owner: req.userId,
            isTransferred: false
        });

        await ticket.save();

        return res.status(200).json({ success: true, message: 'Ticket issued successfully', receipt, ticket, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};

export const getTotalTickets = async (req, res) => {
    try {
        console.log('Getting total tickets...');
        const { eventId } = req.body;

        const totalTickets = await Ticket.countDocuments({ eventId });

        return res.status(200).json({ success: true, totalTickets, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};

export const getTicketsSold = async (req, res) => {
    try {
        console.log('Getting tickets sold...');
        const { eventId } = req.body;

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
        const { to, eventId } = req.body;

        const from = req.userId; // replace with the sender's address

        const ticket = await Ticket.findOne({ owner: from, eventId });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found', statusCode: 404 });
        }

        ticket.owner = to;
        ticket.isTransferred = true;
        await ticket.save();

        return res.status(200).json({ success: true, message: 'Ticket transferred successfully', ticket, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};

export const getTicketDetails = async (req, res) => {
    try {
        console.log('Getting ticket details...');
        const { owner, eventId } = req.body;

        const ticket = await Ticket.findOne({ owner, eventId });
        const hasTicket = !!ticket;

        return res.status(200).json({ success: true, hasTicket, ticket, statusCode: 200 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
    }
};