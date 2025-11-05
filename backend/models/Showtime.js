import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
        },
        screenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Screen',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Time must be in HH:MM format',
            },
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        availableSeats: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
showtimeSchema.index({ movieId: 1, date: 1, time: 1 });
showtimeSchema.index({ date: 1, screenId: 1 });
showtimeSchema.index({ movieId: 1, date: 1 }); // Optimized for date range queries by movie

export default mongoose.model('Showtime', showtimeSchema);
