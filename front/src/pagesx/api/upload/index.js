// pages/api/upload/index.js
import { getServerSession } from 'next-auth/next';
import formidable from 'formidable';
import { createWriteStream, mkdir } from 'fs';
import { join, dirname } from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { createGeneration } from '@/lib/mongo/generations';
import authOptions from '@/pages/api/auth/[...nextauth]';

// Allow file uploads by disabling the Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Make mkdir promisified
const mkdirP = promisify(mkdir);

// Ensure uploads directory exists
const ensureUploadDir = async (dir) => {
  try {
    await mkdirP(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

// Process the incoming form
const processForm = (req) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// Save the file and return its path
const saveFile = async (file, uploadDir, type = 'uploaded') => {
  // Get file extension
  const originalName = file.originalFilename || 'file';
  const ext = originalName.split('.').pop().toLowerCase() || 'bin';
  
  // Create unique filename
  const filename = `${type}/${uuidv4()}.${ext}`;
  const filePath = join(uploadDir, filename);
  
  // Ensure directory exists
  await ensureUploadDir(dirname(filePath));
  
  // Create write stream
  const stream = createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    // Read file content and write to destination
    stream.on('error', (err) => reject(err));
    stream.on('finish', () => resolve(filename));
    
    const fileStream = createReadStream(file.filepath);
    fileStream.pipe(stream);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
  const publicUploadsDir = join(process.cwd(), 'public', 'uploads');
  
  try {
    // Parse the form data
    const { fields, files } = await processForm(req);
    const file = files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Parse other fields
    const fileType = fields.fileType || file.mimetype;
    const isGenerated = fields.isGenerated === 'true';
    const prompt = fields.prompt || file.originalFilename;
    const chatId = fields.chatId;
    const model = fields.model;
    
    // Get file type category
    let type = isGenerated ? 'generated' : 'uploaded';
    
    // Save the file
    const savedFilename = await saveFile(file, publicUploadsDir, type);
    const fileUrl = `${baseUrl}/uploads/${savedFilename}`;
    
    // For images with chat context, save to generations table
    const isImage = fileType.startsWith('image/');
    let generationId = null;
    
    if (isImage && prompt && chatId) {
      const generation = await createGeneration(
        userId,
        chatId,
        prompt,
        fileUrl,
        model || null,
        {
          fileType,
          fileName: file.originalFilename,
          isGenerated,
          width: 1024, // Default values
          height: 768
        }
      );
      
      if (generation) {
        generationId = generation._id;
      }
    }
    
    return res.status(200).json({
      url: fileUrl,
      success: true,
      generationId
    });
  } catch (error) {
    console.error('Server upload error:', error);
    return res.status(500).json({
      error: `Failed to upload file: ${error.message}`
    });
  }
}