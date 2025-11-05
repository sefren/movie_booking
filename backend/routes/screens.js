import express from "express";

import  * as screenController from "../controllers/screenController.js";

const router = express.Router();
// Get all screens
router.get('/', screenController.getAllScreens);

// Get screen by ID
router.get('/:id', screenController.getScreenById);

// Get seat availability for a showtime
router.get('/showtime/:showtimeId/seats', screenController.getShowtimeSeats);

export default router;

