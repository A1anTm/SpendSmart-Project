import mongoose from 'mongoose';

/**
 * Presupuesto de una categoría en un mes
 * 
 * Atributos
 * ----------
 * user_id     : ObjectId (ref: User)  – Usuario propietario del presupuesto.
 * category_id : ObjectId (ref: Category) – Categoría que se controla.
 * month       : String (AAAA-MM)      – Mes calendario al que aplica el presupuesto.
 * limit       : Decimal128            – Cantidad máxima que puede gastarse en ese mes y categoría.
 * threshold   : Number (0-100)        – Porcentaje sobre el límite que, al alcanzarse, genera alerta.
 * isActive    : Boolean               – true  → presupuesto vigente.
 *                                     – false → presupuesto desactivado (soft-delete lógico).
 * isDeleted   : Boolean               – true  → registro marcado como eliminado (soft-delete).
 * createdAt   : Date (automático)     – Fecha y hora de creación del registro.
 * updatedAt   : Date (automático)     – Fecha y hora de la última modificación.
 */
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
  month: {              
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/
},
  limit: {               
    type: mongoose.Types.Decimal128,
    required: true
},
  threshold: {          
    type: Number,
    min: 0,
    max: 100,
    required: true
},
  isActive: {            
    type: Boolean,
    default: true
},
  isDeleted: {        
          type: Boolean,
          default: false,
          index: true
      }
}, { timestamps: true });

budgetSchema.index({ user_id: 1, category_id: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);