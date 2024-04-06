import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mongoose } from "mongoose";
import UserModel from "../models/user.js";
import { createWallet } from "../utils/initWallet.js";
import dotenv from 'dotenv';
import logger from '../utils/consoleLogger.js'

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

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    logger.info(`User signed in successfully for email: ${email}`);
    res.status(200).json({ code: 200, success: true, message: "Signed in successfully", data: { result: oldUser, token } });

  } catch (err) {
    logger.error(`Signin error for email: ${email}`, err);
    res.status(500).json({ code: 500, success: false, message: "Something went wrong" });
  }
};


export const signup = async (req, res) => {
  const { email, password, firstName, lastName, isAdmin, isOrganizer } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    logger.info(`Signup attempt for email: ${email}`);
    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
      logger.info(`User already exists for email: ${email}`);
      return res.status(400).json({ code: 400, success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModel.create([{
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      isAdmin: isAdmin || false,
      isOrganizer: isOrganizer || false, 
      isActive: true
    }], { session });

    const wallet = await createWallet(result[0]._id);

    const token = jwt.sign({ email: result[0].email, id: result[0]._id }, secret, { expiresIn: "1h" });

    logger.info(`User signed up successfully for email: ${email}`);
    res.status(201).json({ code: 201, success: true, message: "User signed up successfully", data: { result: result[0], token, wallet } });

    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`Signup error for email: ${email}`, error);
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

