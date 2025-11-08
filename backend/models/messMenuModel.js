import mongoose from 'mongoose';

const messMenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isNonVeg: {
    type: Boolean,
    default: false
  }
});

const messMenuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  items: [messMenuItemSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
messMenuSchema.index({ date: 1, mealType: 1 });

const MessMenu = mongoose.model('MessMenu', messMenuSchema);

export default MessMenu;