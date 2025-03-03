/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3002",
      NEXT_PUBLIC_R2_ENDPOINT: "https://8c71d4697a2b779352e54a5c62c0448f.eu.r2.cloudflarestorage.com/aistorage",
      NEXT_PUBLIC_R2_PUBLIC_URL: "https://bucket.pixporn.com",
      NEXT_PUBLIC_R2_BUCKET_NAME: "aistorage",
      NEXT_PUBLIC_TOGETHER_API_KEY: "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c",

      R2_ENDPOINT: "https://8c71d4697a2b779352e54a5c62c0448f.eu.r2.cloudflarestorage.com/aistorage",
      R2_ACCESS_KEY_ID: "bcec1dedc76474fa0295196256b450ae",
      R2_SECRET_ACCESS_KEY: "8b05e7b51e595400905c0dd3be8d2380d037d02bfdb4a80ec504f6796a90e4a2",
      R2_BUCKET_NAME: "aistorage"
  },
  async rewrites() {
      return [
          {
              source: '/api/:path*',
              destination: 'http://localhost:3002/:path*' // Proxy to Feathers
          },
          {
              source: '/uploads/:path*',
              destination: 'http://localhost:3002/uploads/:path*' // Proxy to Feathers uploads
          }
      ]
  }
};

export default nextConfig;