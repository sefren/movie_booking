import Screen from '../models/Screen.js';
import Showtime from '../models/Showtime.js';
import Booking from '../models/Booking.js';

// Get all screens
export async function getAllScreens(req, res, next) {
    try {
        const screens = await Screen.find().sort({ name: 1 });

        res.json({
            success: true,
            data: screens
        });
    } catch (error) {
        next(error);
    }
}

// Get screen by ID
export async function getScreenById(req, res, next) {
    try {
        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found'
            });
        }

        res.json({
            success: true,
            data: screen
        });
    } catch (error) {
        next(error);
    }
}

// Get seat availability for a showtime
export async function getShowtimeSeats(req, res, next) {
    try {
        const { showtimeId } = req.params;

        const showtime = await Showtime.findById(showtimeId)
            .populate('screenId');

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found'
            });
        }

        // Get all confirmed and pending bookings for this showtime
        const bookings = await Booking.find({
            showtimeId: showtimeId,
            status: { $in: ['pending', 'confirmed'] }
        });

        // Get all booked seat IDs
        const bookedSeats = bookings.flatMap(booking =>
            booking.selectedSeats.map(seat => seat.seatId)
        );

        // Get screen layout and mark booked seats
        const seatLayout = showtime.screenId.seatLayout.map(seat => ({
            ...seat.toObject(),
            isAvailable: !bookedSeats.includes(seat.seatId)
        }));

        res.json({
            success: true,
            data: {
                screen: {
                    _id: showtime.screenId._id,
                    name: showtime.screenId.name,
                    screenType: showtime.screenId.screenType,
                    totalSeats: showtime.screenId.totalSeats
                },
                seatLayout,
                bookedSeats,
                availableSeats: showtime.availableSeats,
                price: showtime.price
            }
        });
    } catch (error) {
        next(error);
    }
}

