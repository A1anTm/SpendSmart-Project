import mongoose from 'mongoose';

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
    isDeleted: {        // soft-delete
        type: Boolean,
        default: false,
        index: true
    }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// un usuario no puede repetir nombre en metas activas
savingsGoalSchema.index({ user_id: 1, name: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model('SavingsGoal', savingsGoalSchema);