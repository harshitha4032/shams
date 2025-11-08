import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/userModel.js';

dotenv.config();

(async () => {
  try {
    await connectDB();
    const exists = await User.findOne({ email: 'admin@shams.io' });
    if (exists) {
      console.log('Admin already exists:', exists.email);
      process.exit(0);
    }
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shams.io',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
