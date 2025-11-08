import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.ATLAS_URI;
  if (!uri) throw new Error('ATLAS_URI missing in .env');
  
  // Node.js 22+ compatible options for MongoDB Atlas
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  console.log(`MongoDB Atlas connected: ${mongoose.connection.host}`);
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
};
