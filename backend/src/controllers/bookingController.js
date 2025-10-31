import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import User from "../models/User.js";

// Generate unique booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `BK${timestamp}${randomStr}`.toUpperCase();
};

// Get occupied seats for a showtime
export const getOccupiedSeats = async (req, res, next) => {
  try {
    const { movieId, showtimeId, date } = req.query;

    const bookings = await Booking.find({
      movieId,
      "showtime.date": new Date(date),
      status: { $in: ["pending", "confirmed"] },
    });

    const occupiedSeats = bookings.flatMap((booking) =>
      booking.seats.map((seat) => seat.seatId),
    );

    res.status(200).json({
      success: true,
      data: occupiedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// Create booking with seat locking
export const createBooking = async (req, res, next) => {
  try {
    const { movieId, screenId, showtime, seats, customerInfo, totalAmount } =
      req.body;

    // Validate inputs
    if (!seats || seats.length === 0) {
      throw new Error("At least one seat must be selected");
    }

    if (seats.length > 10) {
      throw new Error("Maximum 10 seats can be booked at once");
    }

    // Check if seats are already booked
    const seatIds = seats.map((s) => s.seatId);
    const existingBookings = await Booking.find({
      movieId,
      "showtime.date": new Date(showtime.date),
      "showtime.time": showtime.time,
      "seats.seatId": { $in: seatIds },
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBookings.length > 0) {
      throw new Error("One or more selected seats are already booked");
    }

    // Create booking with 10-minute lock
    const bookingId = generateBookingId();
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const booking = await Booking.create({
      bookingId,
      userId: req.user?._id || null,
      movieId,
      screenId,
      showtime,
      seats,
      customerInfo,
      totalAmount,
      status: "pending",
      lockedUntil,
    });

    // Add booking to user's bookings array if user is logged in
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { bookings: booking._id },
      });
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: "Seats locked. Complete payment within 10 minutes.",
    });
  } catch (error) {
    next(error);
  }
};

// Confirm booking after payment
export const confirmBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { transactionId } = req.body;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      return next(error);
    }

    if (booking.status !== "pending") {
      const error = new Error("Booking is not in pending state");
      error.statusCode = 400;
      return next(error);
    }

    if (new Date() > booking.lockedUntil) {
      booking.status = "cancelled";
      await booking.save();
      const error = new Error("Booking timeout. Please try again.");
      error.statusCode = 400;
      return next(error);
    }

    booking.status = "confirmed";
    booking.paymentStatus = "success";
    booking.transactionId = transactionId;
    booking.completedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking confirmed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      return next(error);
    }

    if (booking.status === "cancelled") {
      const error = new Error("Booking already cancelled");
      error.statusCode = 400;
      return next(error);
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId })
      .populate("movieId")
      .populate("screenId");

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (with filters)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, email, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (email) query["customerInfo.email"] = email;

    const bookings = await Booking.find(query)
      .populate("movieId")
      .populate("screenId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};
