import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    row: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    seatId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['regular', 'premium', 'vip'],
        default: 'regular',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
});

const screenSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        screenType: {
            type: String,
            enum: ['Standard', '3D', 'IMAX', 'Dolby'],
            default: 'Standard',
        },
        totalSeats: {
            type: Number,
            required: true,
        },
        rows: [{
            row: String,
            seatsPerRow: Number,
        }],
        seatLayout: [seatSchema],
        priceMultiplier: {
            type: Number,
            default: 1.0, // IMAX = 1.5x, 3D = 1.3x, etc.
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Screen', screenSchema);
