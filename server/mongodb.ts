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
    console.log('✅ Connected to MongoDB Atlas successfully!');
    await createSuperAdmin();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please add your IP address to MongoDB Atlas whitelist.');
    throw error;
  }
}

// Create superadmin user if it doesn't exist
async function createSuperAdmin() {
  try {
    const { User } = await import('@shared/models');
    const bcrypt = await import('bcrypt');
    
    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email: 'admin@3zero.club' });
    if (existingAdmin) {
      console.log('ℹ️ Superadmin already exists');
      return;
    }

    // Create superadmin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = new User({
      email: 'admin@3zero.club',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      permissions: [],
      isActive: true,
      authType: 'email',
      applicationStatus: 'approved',
      appliedAt: new Date(),
      approvedAt: new Date(),
    });

    await superAdmin.save();
    console.log('✅ Superadmin created: admin@3zero.club / admin123');
  } catch (error) {
    console.error('Error creating superadmin:', error);
  }
}

export default mongoose;