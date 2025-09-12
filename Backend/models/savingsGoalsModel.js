import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
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
    }
}, { 
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    } 
});


export default mongoose.model('SavingsGoal', savingsGoalSchema);