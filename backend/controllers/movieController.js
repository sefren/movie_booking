import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';

// Get all movies with filters
export const getAllMovies = async (req, res, next) => {
    try {
        const { status, genre, search, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};

        if (status) {
            query.status = status;
        }

        if (genre) {
            query.genres = genre;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const movies = await Movie.find(query)
            .sort({ releaseDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Movie.countDocuments(query);

        res.json({
            success: true,
            data: {
                movies,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalMovies: total,
                    moviesPerPage: parseInt(limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single movie by ID
export const getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            });
        }

        res.json({
            success: true,
            data: movie,
        });
    } catch (error) {
        next(error);
    }
};

// Get showtimes for a movie
export const getMovieShowtimes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const query = { movieId: id };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = { $gte: startDate, $lte: endDate };
        } else {
            // Default: show next 60 days (2 months)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 60);

            query.date = { $gte: today, $lte: maxDate };
        }

        const showtimes = await Showtime.find(query)
            .populate('screenId', 'name screenType priceMultiplier totalSeats')
            .sort({ date: 1, time: 1 })
            .lean(); // Use lean() for better performance - returns plain JS objects

        // Group showtimes by date for better organization
        const groupedByDate = {};
        showtimes.forEach(showtime => {
            const dateKey = showtime.date.toISOString().split('T')[0];
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(showtime);
        });

        res.json({
            success: true,
            data: {
                showtimes,
                groupedByDate,
                count: showtimes.length
            }
        });
    } catch (error) {
        next(error);
    }
};