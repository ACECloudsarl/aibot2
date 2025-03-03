// src/middleware/upload.ts
import { Application } from '../declarations';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export default function(app: Application) {
  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, '../../public/uploads');
      const type = req.body.isGenerated === 'true' ? 'generated' : 'uploaded';
      const targetDir = path.join(uploadsDir, type);
      
      // Ensure directory exists
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || 
                  (file.mimetype === 'image/jpeg' ? '.jpg' : 
                   file.mimetype === 'image/png' ? '.png' : '.bin');
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  // Handle upload endpoint
  app.use('/upload', (req, res, next) => {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'No file provided' });
        }
        
        // Get metadata from request
        const isGenerated = req.body.isGenerated === 'true';
        const type = isGenerated ? 'generated' : 'uploaded';
        const prompt = req.body.prompt || file.originalname;
        const chatId = req.body.chatId;
        const userId = req.feathers.user?._id;
        
        // File URL
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const fileUrl = `${protocol}://${host}/uploads/${type}/${file.filename}`;
        
        // Save to generations table if image
        let generationId = null;
        if (file.mimetype.startsWith('image/') && prompt && userId && chatId) {
          const generationsService = app.service('generations');
          const generation = await generationsService.create({
            user_id: userId,
            chat_id: chatId,
            prompt,
            url: fileUrl,
            model: req.body.model || null,
            width: 1024,
            height: 768,
            status: 'completed',
            metadata: {
              fileType: file.mimetype,
              fileName: file.originalname,
              isGenerated
            }
          });
          
          generationId = generation._id;
        }
        
        res.json({
          url: fileUrl,
          success: true,
          generationId
        });
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({
          error: `Upload processing failed: ${error.message}`
        });
      }
    });
  });
}