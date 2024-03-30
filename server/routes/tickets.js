import express from 'express';
import { issueTicket, getTotalTickets, getTicketsSold, transferTicket, getTicketDetails } from '../controllers/ticket.js';
import auth from "../middleware/auth.js"; 

const router = express.Router();

router.post('/issue', auth, issueTicket);
router.get('/total/:eventId', auth, getTotalTickets);
router.get('/sold/:eventId', auth, getTicketsSold);
router.patch('/transfer', auth, transferTicket);
router.get('/details', auth, getTicketDetails);

export default router;