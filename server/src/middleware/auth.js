import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.pe_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session or user not found'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};
