import express from 'express';
import { createEvent, updateEvent, deleteEvent, getEvents } from '../controllers/events.js';
import auth from "../middleware/auth.js"; 
import checkIsOrganizer from "../middleware/isOrganizer.js";

const router = express.Router();

router.post('/create', auth, checkIsOrganizer, createEvent);
router.patch('/update/:eventId', auth, checkIsOrganizer, updateEvent);
router.delete('/delete/:eventId', auth, checkIsOrganizer, deleteEvent);
router.get('/get', auth, getEvents);

export default router;