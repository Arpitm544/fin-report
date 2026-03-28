import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name: name || '' });

    const token = signToken(user._id.toString());
    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error('register', e);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error('login', e);
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    console.error('me', e);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}

/**
 * PATCH profile: optional name, email, and password change (requires current password).
 */
export async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email !== undefined && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      user.email = email;
    }

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Current password is required to set a new password',
        });
      }
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      user.passwordHash = await User.hashPassword(newPassword);
    }

    await user.save();

    const fresh = await User.findById(user._id);
    return res.json({
      user: { id: fresh._id, email: fresh.email, name: fresh.name },
    });
  } catch (e) {
    console.error('updateProfile', e);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
