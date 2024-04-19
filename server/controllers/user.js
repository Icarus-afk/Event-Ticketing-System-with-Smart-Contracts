import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mongoose } from "mongoose";
import UserModel from "../models/user.js";
import { createWallet } from "../utils/initWallet.js";
import dotenv from 'dotenv';
import logger from '../utils/consoleLogger.js'
import redisClient from '../utils//initRedis.js';


dotenv.config();


const secret = process.env.JWT_SECRET;


export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    logger.info(`Signin attempt for email: ${email}`);
    const oldUser = await UserModel.findOne({ email });

    if (!oldUser) {
      logger.info(`User doesn't exist for email: ${email}`);
      return res.status(404).json({ code: 404, success: false, message: "User doesn't exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) {
      logger.info(`Invalid credentials for email: ${email}`);
      return res.status(400).json({ code: 400, success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ id: oldUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });


    logger.info(`User signed in successfully for email: ${email}`);
    res.status(200).json({ code: 200, success: true, message: "Signed in successfully", data: { result: oldUser, a_Token:token, r_Token:refreshToken } });

  } catch (err) {
    logger.error(`Signin error for email: ${email}`, err);
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName, isAdmin, isOrganizer } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ code: 400, success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    const pendingUser = {
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      isAdmin: isAdmin || false,
      isOrganizer: isOrganizer || false,
      isActive: true,
      status: 'pending'
    };

    const result = await UserModel.create(pendingUser);

    const wallet = await createWallet(result._id);

    if (!wallet) {
      throw new Error('Failed to create wallet');
    }

    await UserModel.updateOne({ _id: result._id }, { status: 'active' });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1m" });

    logger.info(`User signed up successfully for email: ${email}`);
    ;
    res.status(201).json({ code: 201, success: true, message: "User signed up successfully", data: { result, token } });

  } catch (error) {
    logger.error(`Signup error for email: ${email}`, error);
    if (error.message === 'Failed to create wallet') {
      await UserModel.deleteOne({ email });
    }
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};


export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dateOfBirth, address, phoneNumber, photo } = req.body;

  logger.info(`Update user attempt for id: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.info(`Invalid id: ${id}`);
    return res.status(404).json({ code: 404, success: false, message: `No user with id: ${id}` });
  }

  const updatedUser = { name: `${firstName} ${lastName}`, dateOfBirth, address, phoneNumber, photo, _id: id };

  try {
    await UserModel.findByIdAndUpdate(id, updatedUser, { new: true });
    logger.info(`User updated successfully for id: ${id}`);
    res.json({ code: 200, success: true, message: "User updated successfully.", data: updatedUser });
  } catch (error) {
    logger.error(`Update user error for id: ${id}`, error);
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  logger.info(`Delete user attempt for id: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.info(`Invalid id: ${id}`);
    return res.status(404).json({ code: 404, success: false, message: `No user with id: ${id}` });
  }

  try {
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      logger.info(`User not found for id: ${id}`);
      return res.status(404).json({ code: 404, success: false, message: `User not found` });
    }

    logger.info(`User deleted successfully for id: ${id}`);
    res.json({ code: 200, success: true, message: "User deleted successfully." });
  } catch (error) {
    logger.error(`Delete user error for id: ${id}`, error);
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};


export const getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
    let userDetails = await redisClient.get(`user:${id}`);

    if (!userDetails) {
      userDetails = await UserModel.findOne({ _id: id });

      if (!userDetails) {
        return res.status(404).json({ code: 404, success: false, message: "User not found" });
      }
      await redisClient.setex(`user:${userDetails.name}`, 3600, JSON.stringify(userDetails));
    } else {
      userDetails = JSON.parse(userDetails);
    }

    res.status(200).json({ code: 200, success: true, data: userDetails });
  } catch (err) {
    logger.error
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};


export const refreshToken = async (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(403).json({ success: false, message: 'Refresh token is required', code: 403 });
  }

  try {
    const userData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await UserModel.findById(userData.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', code: 404 });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1m' });

    // res.cookie('accessToken', token, { httpOnly: true, secure: true });
    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ success: true, message: 'Token refreshed successfully', accessToken: token, code: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error',  code: 500 });
  }
};