import express from 'express';
import { createEvent, updateEvent, deleteEvent, getEvents } from '../controllers/events.js';
import auth from "../middleware/auth.js"; 
import checkIsOrganizer from "../middleware/isOrganizer.js";
import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/event');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // append the file extension
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const router = express.Router();

router.post('/create', upload.single('image'), auth, checkIsOrganizer, createEvent);
router.patch('/update/:eventId',upload.single('image'), auth, checkIsOrganizer, updateEvent);
router.delete('/delete/:eventId', auth, checkIsOrganizer, deleteEvent);
router.get('/get', auth, getEvents);

export default router;