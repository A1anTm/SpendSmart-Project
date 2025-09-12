import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true 
    },
    last_name:  { 
        type: String, 
        required: true 
    },
    username:   { 
        type: String, 
        required: true,
        unique: true, 
        index: true 
    },
    email:      { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    password:   { 
        type: String, 
        required: true 
    },
    phone_number: { 
        type: String, 
        default: null 
    },
    country:    { 
        type: String, 
        index: true, 
        default: null 
    },
    birthdate:  { 
        type: Date,   
        default: null 
    },
    bio:        { 
        type: String, 
        default: null 
    },
    social_accounts: [{ 
        provider: String, 
        account_url: String 
    }],
    password_history: [{ 
        password: String, 
        changed_in: Date 
    }],
    access_history:  [{ 
        device: String, 
        location: String, 
        adress_IP: String, 
        accessed_in: Date 
    }],
    total_login_count: { 
        type: Number, 
        default: 0 
    },
    last_login_at:  { 
        type: Date, 
        default: null 
    },
    is_deleted:     { 
        type: Boolean, 
        default: false, 
        index: true 
    },
    old_data:       { 
        type: mongoose.Schema.Types.Mixed, 
        default: null
    },address: {
    street:  { type: String, default: null },
    city:    { type: String, default: null },
    state:   { type: String, default: null },
    zip:     { type: String, default: null }
    },
    alertSettings: {
    emailAlerts:      { type: Boolean, default: true },
    weeklyReports:    { type: Boolean, default: false },
    monthlyReports:   { type: Boolean, default: true }
    },
    thresholdEnabled: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('User', userSchema);