import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.model';
import { IUser } from '../interfaces/user.interface';

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lkvk23pVNy625U22CO4ALfIFH8S5zQhpSsbAZy6F60A=', {
    expiresIn: '30d',
  });
};

// Define a type for Mongoose's _id
type UserWithId = IUser & { _id: mongoose.Types.ObjectId };

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    }) as UserWithId;

    if (user) {
      const userId = user._id.toString();
      res.status(201).json({
        _id: userId,
        username: user.username,
        email: user.email,
        token: generateToken(userId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }) as UserWithId | null;

    // Check user and password
    if (user && (await user.comparePassword(password))) {
      const userId = user._id.toString();
      res.json({
        _id: userId,
        username: user.username,
        email: user.email,
        token: generateToken(userId),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id) as UserWithId | null;

    if (user) {
      const userId = user._id.toString();
      res.json({
        _id: userId,
        username: user.username,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 