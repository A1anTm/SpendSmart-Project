import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  appliesTo: {
    type: String,
    enum: ['ingreso', 'gasto'],
    default: 'gasto'
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
