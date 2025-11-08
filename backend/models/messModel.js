import mongoose from 'mongoose';

const messSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  capacity: { type: Number, default: 0 },
  menuType: { type: String, enum: ['veg', 'non-veg', 'both'], default: 'both' },
  facilities: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Mess', messSchema);