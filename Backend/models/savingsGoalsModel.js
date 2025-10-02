import mongoose from 'mongoose';

/**
 * Meta de ahorro personal del usuario
 *
 * Atributos
 * ----------
 * user_id        : ObjectId (ref: User, indexado) – Usuario propietario de la meta.
 * name           : String (trim) – Nombre corto descriptivo de la meta (ej. “Viaje a Japón”).
 * description    : String – Texto libre con detalles adicionales (opcional).
 * target_amount  : Decimal128 – Cantidad que se desea alcanzar.
 * current_amount : Decimal128 – Cantidad ahorrada hasta el momento (default 0).
 * due_date       : Date – Fecha límite para conseguir el objetivo.
 * isDeleted      : Boolean – true = meta eliminada (soft-delete); false = activa.
 * created_at     : Date (automático) – Fecha de creación del registro.
 * updated_at     : Date (automático) – Fecha de la última modificación.
 */
const savingsGoalSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    target_amount: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    current_amount: {
        type: mongoose.Types.Decimal128,
        default: 0
    },
    due_date: {
        type: Date,
        required: true
    },
    isDeleted: {        
        type: Boolean,
        default: false,
        index: true
    }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

savingsGoalSchema.index({ user_id: 1, name: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model('SavingsGoal', savingsGoalSchema);