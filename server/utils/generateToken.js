import jwt from 'jsonwebtoken';

export const generateToken = (email, id, secret, expiresIn) => {
  return jwt.sign({ email, id }, secret, { expiresIn });
};