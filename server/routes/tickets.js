import express from 'express';
import { issueTicket, getTotalTicketsSold, transferTicket, getTicketDetails } from '../controllers/ticket.js';
import auth from "../middleware/auth.js"; 

const router = express.Router();

router.post('/issue', auth, issueTicket);
router.get('/total/:eventId', auth, getTotalTicketsSold);
// router.get('/transfarred/:eventId', auth, getTicketsTransfarred);
router.patch('/transfer', auth, transferTicket);
router.get('/details/:eventId', auth, getTicketDetails);

export default router;