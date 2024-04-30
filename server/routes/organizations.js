import express from 'express';
import { createOrganization } from '../controllers/organizations.js';
import auth from '../middleware/auth.js';
const router = express.Router();

router.post('/create-organization', auth, createOrganization);

export default router;