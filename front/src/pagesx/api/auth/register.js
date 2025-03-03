// pages/api/auth/register.js
import { createUser, getUserByEmail } from '@/lib/mongo/users';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create the user
    const user = await createUser({
      email,
      password, // The createUser function will hash this
      full_name: full_name || '',
    });

    // Remove sensitive information
    const safeUser = {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    };

    return res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Failed to register user' });
  }
}