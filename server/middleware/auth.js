import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {      
      decodedData = jwt.verify(token, secret);

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
    }    

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ status: 'error', statusCode: 401, message: 'Token expired. Please sign in again.' });
    }
    console.log(error);
  }
};

export default auth;