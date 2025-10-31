import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieShowtimes,
} from '../controllers/movieController.js';

const router = express.Router();

router.route('/').get(getMovies).post(createMovie);

router.route('/:id').get(getMovieById).put(updateMovie).delete(deleteMovie);

router.route('/:id/showtimes').get(getMovieShowtimes);

export default router;
