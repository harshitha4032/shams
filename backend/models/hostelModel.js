import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'coed'], required: true },
  totalRooms: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  warden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilities: [{ type: String }],
  address: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Hostel', hostelSchema);
