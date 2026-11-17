import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, Workspace } from '../models/index.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'personal_assistant_jwt_secure_secret_token_key_2026_x9283', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      avatar: user.avatar,
      clientInfo: user.clientInfo,
    },
  });
};

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['assistant', 'client']).default('assistant'),
    workspaceName: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'assistant', workspaceName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Create a new workspace for this tenant
    const workspace = await Workspace.create({
      name: workspaceName || `${name.split(' ')[0]}'s Workspace`,
    });

    const user = await User.create({
      name,
      email,
      password,
      role,
      workspaceId: workspace._id,
    });

    workspace.ownerId = user._id;
    await workspace.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const { role = 'assistant' } = req.body;
    const targetEmail = role === 'client' ? 'alex.hastings@acme.com' : 'assistant@executive.ai';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      // Fallback to first user with role
      user = await User.findOne({ role });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo account not found. Please run seed.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
