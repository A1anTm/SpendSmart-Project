import mongoose from 'mongoose';

/**
 * Transacción financiera del usuario
 *
 * Atributos
 * ----------
 * user_id     : ObjectId (ref: User, indexado) – Usuario propietario del movimiento.
 * type        : String ('ingreso' | 'gasto') – Naturaleza de la transacción.
 * amount      : Decimal128 – Monto de la operación (siempre positivo).
 * date        : Date – Fecha en que ocurrió (puede ser diferente a la de creación).
 * category_id : ObjectId (ref: Category, opcional) – Categoría asignada.
 * description : String (opcional) – Nota o detalle adicional.
 * created_at  : Date (automático) – Fecha y hora en que se registró la transacción.
 * updated_at  : Date (automático) – Fecha y hora de la última edición.
 */
const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['ingreso', 'gasto']
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    description: {
        type: String,
        default: null
    }
}, { 
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    } 
});

export default mongoose.model('Transaction', transactionSchema);
