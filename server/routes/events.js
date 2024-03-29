import express from 'express';
import { createEvent, updateEvent, deleteEvent, getEvents } from '../controllers/events.js';
import auth from "../middleware/auth.js"; 

const router = express.Router();

router.post('/create', auth, createEvent);
router.patch('/update/:eventId', auth, updateEvent);
router.delete('/delete/:eventId', auth, deleteEvent);
router.get('/get', auth, getEvents);

export default router;