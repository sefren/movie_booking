import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    rows: {
      type: [String],
      required: true,
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    seatsPerRow: {
      type: Number,
      required: true,
      default: 12,
    },
    aisleAfterSeat: {
      type: Number,
      default: 6,
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX', '3D', 'Dolby', 'VIP'],
      default: 'Standard',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Screen', screenSchema);
