// app/api/r2/getUploadUrl/route.js
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    const client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Conditions: [
        ['content-length-range', 0, 10485760], // Max 10MB
        ['eq', '$Content-Type', contentType],
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 300, // 5 minutes
    });

    console.log(url)

    return NextResponse.json({ url, fields });
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL: ' + error.message },
      { status: 500 }
    );
  }
}