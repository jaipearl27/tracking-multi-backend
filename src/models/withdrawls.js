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
        default: true //change in future if explicit approval is required.
    },
    amount: {
        type: Number,
        required: [true, 'Withdrawal Amount is required.'],
        min: [0.01, 'Withdrawal amount must be positive.']
    },
}, { timestamps: true });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;