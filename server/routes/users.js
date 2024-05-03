import express from 'express';
import { signin, signup, deleteUser, updateUser, getUserDetails, refreshToken, verifyToken } from '../controllers/user.js'
import auth from '../middleware/auth.js';
import passwordStrength from '../middleware/passwordStrength.js'
import passport from '../utils/passportConfig.js';

import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/user_image');
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

router.get('/verify-token', verifyToken);
router.post('/signin', signin);
router.post('/signup', upload.single('userImage'), passwordStrength, signup);
router.post('/refresh-token', refreshToken);
router.delete('/:id', auth, deleteUser);
router.patch('/:id', auth, updateUser);
router.get('/:id', auth, getUserDetails);

// Google authentication routes
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/home.html');
});

export default router;