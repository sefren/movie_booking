import express from "express";

import * as adminController from "../controllers/adminController.js";

const router = express.Router();
// Movie Management
router.post('/movies', adminController.createMovie);
router.put('/movies/:id', adminController.updateMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// Showtime Management
router.post('/showtimes', adminController.createShowtime);
router.get('/showtimes', adminController.getAllShowtimes);
router.put('/showtimes/:id', adminController.updateShowtime);
router.delete('/showtimes/:id', adminController.deleteShowtime);

export default router;

