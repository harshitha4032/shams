import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['plumbing', 'electricity', 'cleaning', 'other'], required: true },
  description: { type: String, required: true },
  imageUrl: String,
  status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
  remarks: String
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
