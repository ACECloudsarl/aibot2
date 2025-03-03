// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';


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
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType');
    const isGenerated = formData.get('isGenerated') === 'true';
    
    // Optional fields that may be present
    const prompt = formData.get('prompt');
    const userId = formData.get('userId');
    const chatId = formData.get('chatId');
    const model = formData.get('model');
    
    console.log('Upload request received:', {
      fileType,
      isGenerated,
      prompt: prompt ? 'Present' : 'Not provided',
      userId: userId ? 'Present' : 'Not provided',
      chatId: chatId ? 'Present' : 'Not provided',
      model: model ? model : 'Not provided'
    });
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Generate a unique filename
    const extension = getFileExtension(fileType);
    const type = isGenerated ? 'generated' : 'uploaded';
    const filename = `${type}/${uuidv4()}.${extension}`;
    
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
     
    // Create the public URL 
    const fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/aistorage/${filename}`;
    console.log('File uploaded successfully:', fileUrl);
    
    // Save to generations table if it's an image (either generated or uploaded) and we have required data
    const isImage = fileType.startsWith('image/');
    if (isImage && prompt && userId && chatId) {
      try {
        console.log('Saving to generations table:', {
          user_id: userId,
          chat_id: chatId,
          prompt: prompt || file.name,
          model: model || null,
          is_generated: isGenerated
        });
        
        const { data, error } = await supabase
          .from('generations')
          .insert({
            user_id: userId,
            chat_id: chatId,
            prompt: prompt || file.name,
            url: fileUrl,
            model: model || null,
            width: 1024, // Default values
            height: 768,
            status: 'completed',
            metadata: { 
              fileType,
              fileName: file.name,
              isGenerated
            }
          })
          .select();
        
        if (error) {
          console.error('Error saving to generations table:', error);
        } else {
          console.log('Saved to generations table:', data);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with the upload even if DB save fails
      }
    } else {
      console.log('Not saving to generations table, missing data or not an image:', {
        isImage,
        hasPrompt: !!prompt,
        hasUserId: !!userId,
        hasChatId: !!chatId
      });
    }
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true
    });
    
  } catch (error) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + error.message },
      { status: 500 }
    );
  }
}

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