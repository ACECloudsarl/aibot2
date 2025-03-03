// pages/api/user/profile.js
import { getServerSession } from 'next-auth/next';
import { getUserById, updateUserProfile } from '@/lib/mongo/users';
import authOptions from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  // GET request to fetch profile
  if (req.method === 'GET') {
    try {
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove sensitive information
      const profile = {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      };

      return res.status(200).json({ profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ message: 'Failed to fetch profile' });
    }
  }

  // PUT request to update profile
  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Don't allow email updates through this endpoint
      if (updates.email) {
        delete updates.email;
      }
      
      // If updating password, hash it
      if (updates.password) {
        updates.password = await hash(updates.password, 12);
      }

      const updatedUser = await updateUserProfile(userId, updates);
      
      // Remove sensitive information
      const profile = {
        id: updatedUser._id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url,
        created_at: updatedUser.created_at,
      };

      return res.status(200).json({ profile });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}