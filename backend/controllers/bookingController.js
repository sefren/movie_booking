import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';

// Create a new booking
export async function createBooking(req, res, next) {
    try {
        const { showtimeId, selectedSeats, customerName, customerEmail, customerPhone } = req.body;

        // Validate input
        if (!showtimeId || !selectedSeats || selectedSeats.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Showtime ID and selected seats are required'
            });
        }

        // Get showtime details
        const showtime = await Showtime.findById(showtimeId)
            .populate('movieId')
            .populate('screenId');

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: 'Showtime not found'
            });
        }

        // Check if seats are available
        const existingBookings = await Booking.find({
            showtimeId: showtimeId,
            status: { $in: ['pending', 'confirmed'] }
        });

        const bookedSeatIds = existingBookings.flatMap(booking =>
            booking.selectedSeats.map(seat => seat.seatId)
        );

        const requestedSeatIds = selectedSeats.map(seat => seat.seatId);
        const unavailableSeats = requestedSeatIds.filter(seatId =>
            bookedSeatIds.includes(seatId)
        );

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some seats are already booked',
                unavailableSeats
            });
        }

        // Calculate total amount
        const totalAmount = selectedSeats.reduce((sum, seat) => sum + (seat.price || showtime.price), 0);

        // Calculate lock expiry (10 minutes from now)
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 10);

        // Create booking with pending status
        const booking = await Booking.create({
            movieId: showtime.movieId._id,
            showtimeId: showtimeId,
            screenId: showtime.screenId._id,
            customerName,
            customerEmail,
            customerPhone,
            selectedSeats,
            totalAmount,
            status: 'pending', // Pending until payment is confirmed
            expiresAt: lockedUntil,
            transactionId: null // Will be set after payment
        });

        // Update available seats
        await Showtime.findByIdAndUpdate(showtimeId, {
            $inc: { availableSeats: -selectedSeats.length }
        });

        // Populate booking details for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('movieId', 'title posterUrl duration')
            .populate('screenId', 'name screenType')
            .populate('showtimeId', 'date time price');

        // Format response to match frontend expectations
        const response = {
            _id: populatedBooking._id,
            bookingId: populatedBooking._id, // Use _id as bookingId
            movieId: populatedBooking.movieId,
            showtimeId: populatedBooking.showtimeId,
            screenId: populatedBooking.screenId,
            customerName: populatedBooking.customerName,
            customerEmail: populatedBooking.customerEmail,
            customerPhone: populatedBooking.customerPhone,
            customerInfo: {
                name: populatedBooking.customerName,
                email: populatedBooking.customerEmail,
                phone: populatedBooking.customerPhone
            },
            selectedSeats: populatedBooking.selectedSeats,
            seats: populatedBooking.selectedSeats, // Alias for frontend compatibility
            totalAmount: populatedBooking.totalAmount,
            total: populatedBooking.totalAmount, // Alias
            status: populatedBooking.status,
            transactionId: populatedBooking.transactionId,
            lockedUntil: populatedBooking.expiresAt,
            bookingDate: populatedBooking.bookingDate,
            date: populatedBooking.showtimeId.date,
            movie: {
                title: populatedBooking.movieId.title,
                poster_path: populatedBooking.movieId.posterUrl,
                posterPath: populatedBooking.movieId.posterUrl,
                duration: populatedBooking.movieId.duration,
                runtime: populatedBooking.movieId.duration
            },
            showtime: {
                date: populatedBooking.showtimeId.date,
                time: populatedBooking.showtimeId.time,
                price: populatedBooking.showtimeId.price
            }
        };

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

// Get user bookings by email
export async function getUserBookings(req, res, next) {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const bookings = await Booking.find({ customerEmail: email })
            .populate('movieId', 'title posterUrl duration')
            .populate('screenId', 'name screenType')
            .populate('showtimeId', 'date time price')
            .sort({ bookingDate: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

// Get occupied seats for a showtime
export async function getOccupiedSeats(req, res, next) {
    try {
        const { showtimeId } = req.query;

        if (!showtimeId) {
            return res.status(400).json({
                success: false,
                message: 'Showtime ID is required'
            });
        }

        // Find all confirmed bookings for this showtime
        const bookings = await Booking.find({
            showtimeId: showtimeId,
            status: { $in: ['pending', 'confirmed'] }
        }).select('selectedSeats');

        // Extract all occupied seat IDs
        const occupiedSeats = bookings.flatMap(booking =>
            booking.selectedSeats.map(seat => seat.seatId)
        );

        res.json({
            success: true,
            data: occupiedSeats
        });
    } catch (error) {
        next(error);
    }
}

// Get booking by ID
export async function getBookingById(req, res, next) {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movieId')
            .populate('screenId')
            .populate('showtimeId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

// Cancel booking
export async function cancelBooking(req, res, next) {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Restore available seats
        await Showtime.findByIdAndUpdate(booking.showtimeId, {
            $inc: { availableSeats: booking.selectedSeats.length }
        });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

// Confirm booking after payment
export async function confirmBooking(req, res, next) {
    try {
        const { id } = req.params;
        const { transactionId } = req.body;

        console.log('💳 Confirming booking:', { id, transactionId });

        const booking = await Booking.findById(id);

        if (!booking) {
            console.log('❌ Booking not found:', id);
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('📋 Current booking status:', booking.status);

        if (booking.status === 'confirmed') {
            console.log('⚠️  Booking already confirmed');
            return res.status(400).json({
                success: false,
                message: 'Booking is already confirmed'
            });
        }

        // Check if booking has expired
        if (new Date() > booking.expiresAt) {
            console.log('⏰ Booking expired');
            // Restore seats
            await Showtime.findByIdAndUpdate(booking.showtimeId, {
                $inc: { availableSeats: booking.selectedSeats.length }
            });

            booking.status = 'expired';
            await booking.save();

            return res.status(400).json({
                success: false,
                message: 'Booking has expired. Please book again.'
            });
        }

        // Confirm booking
        booking.status = 'confirmed';
        booking.transactionId = transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await booking.save();

        console.log('✅ Booking confirmed successfully:', {
            id: booking._id,
            status: booking.status,
            transactionId: booking.transactionId
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('movieId', 'title posterUrl duration')
            .populate('screenId', 'name screenType')
            .populate('showtimeId', 'date time price');

        // Format response
        const response = {
            _id: populatedBooking._id,
            bookingId: populatedBooking._id,
            movieId: populatedBooking.movieId,
            showtimeId: populatedBooking.showtimeId,
            screenId: populatedBooking.screenId,
            customerName: populatedBooking.customerName,
            customerEmail: populatedBooking.customerEmail,
            customerPhone: populatedBooking.customerPhone,
            customerInfo: {
                name: populatedBooking.customerName,
                email: populatedBooking.customerEmail,
                phone: populatedBooking.customerPhone
            },
            selectedSeats: populatedBooking.selectedSeats,
            seats: populatedBooking.selectedSeats,
            totalAmount: populatedBooking.totalAmount,
            total: populatedBooking.totalAmount,
            status: populatedBooking.status,
            transactionId: populatedBooking.transactionId,
            bookingDate: populatedBooking.bookingDate,
            date: populatedBooking.showtimeId.date,
            movie: {
                title: populatedBooking.movieId.title,
                poster_path: populatedBooking.movieId.posterUrl,
                posterPath: populatedBooking.movieId.posterUrl,
                duration: populatedBooking.movieId.duration,
                runtime: populatedBooking.movieId.duration
            },
            showtime: {
                date: populatedBooking.showtimeId.date,
                time: populatedBooking.showtimeId.time,
                price: populatedBooking.showtimeId.price
            }
        };

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

// Get all bookings (admin or user specific)
export async function getAllBookings(req, res, next) {
    try {
        const { page = 1, limit = 20, status, email } = req.query;

        const query = {};

        // Filter by status
        if (status) {
            query.status = status;
        } else {
            // By default, only show confirmed and pending (not expired/cancelled)
            query.status = { $in: ['confirmed', 'pending'] };
        }

        // Filter by email
        if (email) {
            query.customerEmail = email;
        }

        const skip = (page - 1) * limit;

        const bookings = await Booking.find(query)
            .populate('movieId', 'title posterUrl duration')
            .populate('screenId', 'name screenType')
            .populate('showtimeId', 'date time price')
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        // Check for expired pending bookings and mark them
        const now = new Date();
        const expiredBookings = [];

        for (const booking of bookings) {
            if (booking.status === 'pending' && booking.expiresAt && now > booking.expiresAt) {
                // Mark as expired
                booking.status = 'expired';
                await booking.save();

                // Restore seats
                await Showtime.findByIdAndUpdate(booking.showtimeId, {
                    $inc: { availableSeats: booking.selectedSeats.length }
                });

                expiredBookings.push(booking._id);
            }
        }

        // Filter out expired bookings from the response
        const activeBookings = bookings.filter(b => !expiredBookings.includes(b._id));

        // Format bookings to match frontend expectations
        const formattedBookings = activeBookings.map(booking => ({
            _id: booking._id,
            bookingId: booking._id,
            movieId: booking.movieId,
            showtimeId: booking.showtimeId,
            screenId: booking.screenId,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            customerPhone: booking.customerPhone,
            customerInfo: {
                name: booking.customerName,
                email: booking.customerEmail,
                phone: booking.customerPhone
            },
            selectedSeats: booking.selectedSeats,
            seats: booking.selectedSeats, // Alias for frontend
            totalAmount: booking.totalAmount,
            total: booking.totalAmount,
            status: booking.status,
            transactionId: booking.transactionId,
            lockedUntil: booking.expiresAt,
            bookingDate: booking.bookingDate,
            date: booking.showtimeId?.date,
            movie: {
                title: booking.movieId?.title,
                poster_path: booking.movieId?.posterUrl,
                posterPath: booking.movieId?.posterUrl,
                duration: booking.movieId?.duration,
                runtime: booking.movieId?.duration
            },
            showtime: {
                date: booking.showtimeId?.date,
                time: booking.showtimeId?.time,
                price: booking.showtimeId?.price
            }
        }));

        // If email filter is used, return just the bookings array
        if (email) {
            return res.json({
                success: true,
                data: formattedBookings
            });
        }

        // Otherwise return with pagination (for admin)
        res.json({
            success: true,
            data: {
                bookings: formattedBookings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalBookings: total,
                    bookingsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

