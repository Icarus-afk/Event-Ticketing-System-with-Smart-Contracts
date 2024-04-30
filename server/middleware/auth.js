import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from '../models/user.js'; // import your User model

dotenv.config();

const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token; 
    console.log(token);
    if (!token) {
      throw new jwt.JsonWebTokenError('No token provided');
    }

    const isCustomAuth = token.length < 500;

    let decodedData;

    if (isCustomAuth) {      
      decodedData = jwt.verify(token, secret);

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
    }    

    // Fetch the user from the database
    req.user = await User.findById(req.userId);

    next();
    console.log('User ID:', req.userId);
console.log('User:', req.user);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token. Please sign in again.', statusCode: 401 });
    }
    console.log(error);
    res.status(500).json({ success: false, message: 'Authentication failed', statusCode: 500 });
  }
};

export default auth;