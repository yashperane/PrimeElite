import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Admin } from '../models/Admin.js';
import { config } from '../config/env.js';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
  })
});

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Admin user with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save both hashed password and rawPassword (as requested)
    const newAdmin = await Admin.create({
      email: normalizedEmail,
      passwordHash,
      rawPassword: password
    });

    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const isProduction = config.nodeEnv === 'production';

    res.cookie('pe_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: newAdmin._id,
          email: newAdmin.email,
          rawPassword: newAdmin.rawPassword
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Keep rawPassword updated if it was empty
    if (!admin.rawPassword) {
      admin.rawPassword = password;
      await admin.save();
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const isProduction = config.nodeEnv === 'production';

    res.cookie('pe_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          rawPassword: admin.rawPassword
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  const isProduction = config.nodeEnv === 'production';
  res.clearCookie('pe_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        rawPassword: req.admin.rawPassword
      }
    }
  });
};
