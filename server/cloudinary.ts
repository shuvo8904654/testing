import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dufutyrun',
  api_key: process.env.CLOUDINARY_API_KEY || '881987745591264',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'wSA34aCe6dwo5UJf8NpQYQJdOZ0'
});

export default cloudinary;