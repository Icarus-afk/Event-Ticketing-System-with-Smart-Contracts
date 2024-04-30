import Organization from '../models/organizer.js';
import User from '../models/user.js';
import logger from '../utils/consoleLogger.js'; 
import { createWallet } from '../utils/initWallet.js';

export const createOrganization = async (req, res) => {
  const { name, description, address, phoneNumber, email, website, customLinks } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, data: {}, message: 'User not found' });
    }

    const newOrganization = new Organization({
      name,
      description,
      address,
      phoneNumber,
      email,
      website,
      customLinks,
      user: userId
    });

    const savedOrganization = await newOrganization.save();

    const newWallet = await createWallet(savedOrganization._id, 'organizer');
    
    user.organizations.push(savedOrganization._id);
    user.isOrganizer = true;
    await user.save();

    res.status(201).json({ success: true, data: savedOrganization, message: 'Organization created successfully' });
  } catch (error) {
    logger.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, data: {}, message: 'Invalid input data' });
    }
    if (error.code && error.code === 11000) {
      return res.status(400).json({ success: false, data: {}, message: 'Duplicate field value entered' });
    }
  }
};