import express from 'express';
import {
  getOccupiedSeats,
  createBooking,
  confirmBooking,
  cancelBooking,
  getBookingById,
  getAllBookings,
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/occupied-seats', getOccupiedSeats);
router.get('/all', getAllBookings);
router.post('/', createBooking);
router.get('/:bookingId', getBookingById);
router.post('/:bookingId/confirm', confirmBooking);
router.post('/:bookingId/cancel', cancelBooking);

export default router;
