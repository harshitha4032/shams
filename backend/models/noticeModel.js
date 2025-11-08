import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'wardens'], default: 'all' }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);
