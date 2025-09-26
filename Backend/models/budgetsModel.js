import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
},
category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
},
  month: {               // AAAA-MM
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/
},
  limit: {               // límite mensual
    type: mongoose.Types.Decimal128,
    required: true
},
  threshold: {           // % sobre el límite que dispara alerta (0-100)
    type: Number,
    min: 0,
    max: 100,
    required: true
},
  isActive: {            // soft-delete lógico
    type: Boolean,
    default: true
},
  isDeleted: {        // soft-delete
          type: Boolean,
          default: false,
          index: true
      }
}, { timestamps: true });

// un usuario sólo puede tener UN presupuesto activo por categoría/mes
budgetSchema.index({ user_id: 1, category_id: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);