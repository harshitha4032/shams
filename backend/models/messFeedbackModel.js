import mongoose from 'mongoose';

const messFeedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItem: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: String
}, { timestamps: true });

export default mongoose.model('MessFeedback', messFeedbackSchema);
