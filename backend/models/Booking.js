import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
        showtimeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Showtime',
            required: true,
        },
        screenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Screen',
            required: true,
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        customerEmail: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        customerPhone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        selectedSeats: [{
            seatId: String,
            row: String,
            number: Number,
            price: Number,
        }],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'expired'],
            default: 'pending',
        },
        transactionId: {
            type: String,
            sparse: true,
        },
        bookingDate: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
    },
    {
        timestamps: true,
    }
);

// Index for seat locking queries
bookingSchema.index({ showtimeId: 1, status: 1 });
bookingSchema.index({ customerEmail: 1, bookingDate: -1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Booking', bookingSchema);
