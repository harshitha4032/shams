import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hostel: { type: String, required: true },
  floor: { type: Number, required: true },
  number: { type: String, required: true },
  roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'], default: 'double' },
  capacity: { type: Number, default: 2 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  assignedWarden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilities: [{ type: String }],
  hasAC: { type: Boolean, default: false },
  feePerYear: { type: Number, default: 0 },
  maintenanceStatus: { type: String, enum: ['good', 'needs_repair', 'under_maintenance'], default: 'good' },
  lastMaintenance: { type: Date }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
