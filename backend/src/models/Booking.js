import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
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
    showtime: {
      time: String,
      date: Date,
    },
    seats: [
      {
        seatId: String,
        row: String,
        number: Number,
      },
    ],
    customerInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: String,
    lockedUntil: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ movieId: 1, 'showtime.date': 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Booking', bookingSchema);
