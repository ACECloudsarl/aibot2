// pages/api/upload/setup.js
import { mkdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    // Create uploads directories if they don't exist
    const publicUploadsDir = join(process.cwd(), 'public', 'uploads');
    const generatedDir = join(publicUploadsDir, 'generated');
    const uploadedDir = join(publicUploadsDir, 'uploaded');
    
    await mkdir(publicUploadsDir, { recursive: true });
    await mkdir(generatedDir, { recursive: true });
    await mkdir(uploadedDir, { recursive: true });
    
    return res.status(200).json({ success: true, message: 'Upload directories created' });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: `Setup failed: ${error.message}` });
  }
}