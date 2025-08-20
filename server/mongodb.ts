import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shuvo:shuvo@cluster0.13jzgii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let isConnected = false;

export async function connectToMongoDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB Atlas successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please add your IP address to MongoDB Atlas whitelist. Using memory storage as fallback.');
    throw error;
  }
}

export default mongoose;