import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Movie title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Movie description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        posterUrl: {
            type: String,
            required: [true, 'Poster URL is required'],
            trim: true,
        },
        backdropUrl: {
            type: String,
            trim: true,
        },
        trailerUrl: {
            type: String,
            trim: true,
        },
        genres: [{
            type: String,
        }],
        duration: {
            type: Number, // in minutes
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 minute'],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 10,
        },
        releaseDate: {
            type: Date,
            required: [true, 'Release date is required'],
        },
        originalLanguage: {
            type: String,
            default: 'EN',
        },
        status: {
            type: String,
            enum: ['now-showing', 'coming-soon', 'ended'],
            default: 'now-showing',
        },
        cast: [{
            name: String,
            character: String,
            profileUrl: String,
        }],
        crew: [{
            name: String,
            job: String,
            profileUrl: String,
        }],
        director: {
            type: String,
        },
        ageRating: {
            type: String,
            enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Not Rated'],
            default: 'Not Rated',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for showtimes
movieSchema.virtual('showtimes', {
    ref: 'Showtime',
    localField: '_id',
    foreignField: 'movieId',
});

// Virtual for showtime count
movieSchema.virtual('showtimeCount', {
    ref: 'Showtime',
    localField: '_id',
    foreignField: 'movieId',
    count: true
});

// Index for better search performance (without text index to avoid language conflicts)
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ title: 1 });

export default mongoose.model('Movie', movieSchema);
