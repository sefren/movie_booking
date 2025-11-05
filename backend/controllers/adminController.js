// controllers/adminController.js
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import Showtime from "../models/Showtime.js";

// ============================================================================
// MOVIE MANAGEMENT
// ============================================================================

// Create a new movie
export async function createMovie(req, res, next) {
    try {
        const movie = new Movie(req.body);
        await movie.save();

        res.status(201).json({
            success: true,
            message: 'Movie created successfully',
            data: movie,
        });
    } catch (error) {
        next(error);
    }
}

// Update movie
export async function updateMovie(req, res, next) {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            });
        }

        res.json({
            success: true,
            message: 'Movie updated successfully',
            data: movie,
        });
    } catch (error) {
        next(error);
    }
}

// Delete movie
export async function deleteMovie(req, res, next) {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            });
        }

        // Also delete associated showtimes
        await Showtime.deleteMany({ movieId: req.params.id });

        res.json({
            success: true,
            message: 'Movie and associated showtimes deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// SHOWTIME MANAGEMENT
// ============================================================================

// Create showtime
export async function createShowtime(req, res, next) {
    try {
        const { movieId, screenId, date, time, price } = req.body;

        // Verify movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            });
        }

        // Verify screen exists
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found',
            });
        }

        // Check if showtime already exists
        const existingShowtime = await Showtime.findOne({
            screenId,
            date: new Date(date),
            time,
        });

        if (existingShowtime) {
            return res.status(400).json({
                success: false,
                message: 'Showtime already exists for this screen at this time',
            });
        }

        const showtime = new Showtime({
            movieId,
            screenId,
            date: new Date(date),
            time,
            price: price || 12.5,
            availableSeats: screen.totalSeats,
        });

        await showtime.save();

        res.status(201).json({
            success: true,
            message: 'Showtime created successfully',
            data: showtime,
        });
    } catch (error) {
        next(error);
    }
}

// Update showtime
export async function updateShowtime(req, res, next) {
    try {
        const showtime = await Showtime.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found',
            });
        }

        res.json({
            success: true,
            message: 'Showtime updated successfully',
            data: showtime,
        });
    } catch (error) {
        next(error);
    }
}

// Delete showtime
export async function deleteShowtime(req, res, next) {
    try {
        const showtime = await Showtime.findByIdAndDelete(req.params.id);

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found',
            });
        }

        res.json({
            success: true,
            message: 'Showtime deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

// Get all showtimes
export async function getAllShowtimes(req, res, next) {
    try {
        const { movieId, screenId, date } = req.query;

        const query = {};
        if (movieId) query.movieId = movieId;
        if (screenId) query.screenId = screenId;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const showtimes = await Showtime.find(query)
            .populate('movieId', 'title posterUrl duration')
            .populate('screenId', 'name screenType')
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            data: showtimes,
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// SCREEN MANAGEMENT
// ============================================================================

// Create screen
export async function createScreen(req, res, next) {
    try {
        const screen = new Screen(req.body);
        await screen.save();

        res.status(201).json({
            success: true,
            message: 'Screen created successfully',
            data: screen,
        });
    } catch (error) {
        next(error);
    }
}

// Update screen
export async function updateScreen(req, res, next) {
    try {
        const screen = await Screen.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found',
            });
        }

        res.json({
            success: true,
            message: 'Screen updated successfully',
            data: screen,
        });
    } catch (error) {
        next(error);
    }
}

// Delete screen
export async function deleteScreen(req, res, next) {
    try {
        const screen = await Screen.findByIdAndDelete(req.params.id);

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found',
            });
        }

        // Also delete associated showtimes
        await Showtime.deleteMany({ screenId: req.params.id });

        res.json({
            success: true,
            message: 'Screen and associated showtimes deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

// Bulk create showtimes
export async function bulkCreateShowtimes(req, res, next) {
    try {
        const { showtimes } = req.body;

        if (!Array.isArray(showtimes) || showtimes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Showtimes array is required',
            });
        }

        const createdShowtimes = await Showtime.insertMany(showtimes);

        res.status(201).json({
            success: true,
            message: `${createdShowtimes.length} showtimes created successfully`,
            data: createdShowtimes,
        });
    } catch (error) {
        next(error);
    }
}