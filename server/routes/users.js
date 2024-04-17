import express from 'express';
import { signin, signup, deleteUser, updateUser,getUserDetails, refreshToken } from '../controllers/user.js'
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/refresh-token', refreshToken);
router.delete('/:id', auth, deleteUser);
router.patch('/:id', auth, updateUser);
router.get('/:id', auth, getUserDetails);

export default router;