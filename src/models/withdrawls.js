import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID that withdrew is required.'],
    },
    approved: {
        type: Boolean,
        required: false,
        default: false
    },
    amount: {
        type: Number,
        required: [true, 'Withdrawal Amount is required.'],
        min: [0.01, 'Withdrawal amount must be positive.']
    },
    currency: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;