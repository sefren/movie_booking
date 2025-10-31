import Movie from '../models/Movie.js';

// Get all movies with filters
export const getMovies = async (req, res, next) => {
  try {
    const { status, genre, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (genre) query.genres = genre;
    if (search) query.$text = { $search: search };

    const movies = await Movie.find(query)
      .sort({ releaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('showtimes.screenId');

    const count = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      data: movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// Get single movie by ID
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('showtimes.screenId');
    
    if (!movie) {
      const error = new Error('Movie not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// Create new movie (admin)
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
      success: true,
      data: movie,
      message: 'Movie created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update movie
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      const error = new Error('Movie not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: movie,
      message: 'Movie updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete movie
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      const error = new Error('Movie not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get available showtimes for a movie
export const getMovieShowtimes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const movie = await Movie.findById(id).populate('showtimes.screenId');

    if (!movie) {
      const error = new Error('Movie not found');
      error.statusCode = 404;
      return next(error);
    }

    let showtimes = movie.showtimes;

    if (date) {
      const searchDate = new Date(date);
      showtimes = showtimes.filter(
        (st) => st.date.toDateString() === searchDate.toDateString()
      );
    }

    res.status(200).json({
      success: true,
      data: {
        movie: {
          id: movie._id,
          title: movie.title,
        },
        showtimes,
      },
    });
  } catch (error) {
    next(error);
  }
};
