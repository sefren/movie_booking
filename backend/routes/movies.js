import express from "express";

import  * as movieController from "../controllers/movieController.js";

const router = express.Router();
// Get all movies with filters
router.get('/', movieController.getAllMovies);

// Get single movie by ID
router.get('/:id', movieController.getMovieById);

// Get showtimes for a movie
router.get('/:id/showtimes', movieController.getMovieShowtimes);

export default router;

