// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth/next';
import { v4 as uuidv4 } from 'uuid';
import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/auth';
import { createGeneration } from '@/lib/mongo/generations';

// Initialize S3 client for R2
const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  // Authenticate user
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const userId = session.user.id;
  
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get metadata
    const fileType = formData.get('fileType') || file.type;
    const isGenerated = formData.get('isGenerated') === 'true';
    const prompt = formData.get('prompt') || file.name;
    const chatId = formData.get('chatId');
    const model = formData.get('model');
    
    // Generate a unique filename
    const fileExtension = getFileExtension(fileType);
    const type = isGenerated ? 'generated' : 'uploaded';
    const filename = `${type}/${uuidv4()}.${fileExtension}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: fileType,
    });
    
    await client.send(command);
    
    // Create the public URL using the R2 public endpoint
    // Include the bucket name (aistorage) in the URL path
    const fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/aistorage/${filename}`;
    console.log('File uploaded successfully to R2:', fileUrl);
    
    // Save to generations table for images
    let generationId = null;
    const isImage = fileType.startsWith('image/');
    
    if (isImage && prompt && chatId) {
      const generation = await createGeneration(
        userId,
        chatId,
        prompt,
        fileUrl,
        model || null,
        {
          fileType,
          fileName: file.name,
          isGenerated,
          width: 1024, // Default values
          height: 768
        }
      );
      
      if (generation) {
        generationId = generation._id;
      }
    }
    
    return NextResponse.json({
      url: fileUrl,
      success: true,
      generationId
    });
  } catch (error) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to get file extension
function getFileExtension(fileType) {
  const typeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/csv': 'csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
  };
  
  return typeMap[fileType] || 'bin';
}