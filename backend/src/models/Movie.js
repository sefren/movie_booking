import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  time: {
    type: String,
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
  availableSeats: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 12.5,
  },
});

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    posterPath: String,
    backdropPath: String,
    genres: [String],
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    releaseDate: Date,
    language: String,
    status: {
      type: String,
      enum: ['now_playing', 'upcoming', 'ended'],
      default: 'now_playing',
    },
    showtimes: [showtimeSchema],
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ status: 1, releaseDate: -1 });

export default mongoose.model('Movie', movieSchema);
