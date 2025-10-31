# Movie Booking Backend API

Backend API for the movie booking application with seat locking, transaction management, and multiple screens.

## Features

✅ **CRUD Operations** for Movies, Bookings, and Screens  
✅ **Seat Locking Logic** - Prevents double booking with 10-minute reservation  
✅ **Atomic Transactions** - Using Mongoose sessions for data consistency  
✅ **Multiple Screens** - Support for different screen types (Standard, IMAX, 3D, etc.)  
✅ **Dynamic Showtimes** - Multiple showtimes per day across different screens  
✅ **Booking Management** - Create, confirm, cancel bookings  
✅ **Real-time Seat Availability** - Track occupied seats per showtime  

## Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)

## Installation

```bash
cd backend
npm install
```

## Configuration

Edit `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
NODE_ENV=development
```

## Database Setup

Seed the database with sample movies and screens:

```bash
npm run seed
```

This will create:
- 3 Screens (Standard, IMAX, 3D)
- 3 Movies with multiple showtimes
- 7 days of showtimes with 5 shows per day

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on: `http://localhost:5000`

## API Endpoints

### Movies

- `GET /api/movies` - Get all movies (with filters: status, genre, search)
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create new movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie
- `GET /api/movies/:id/showtimes` - Get showtimes for a movie

### Bookings

- `GET /api/bookings/occupied-seats?movieId=&date=` - Get occupied seats
- `POST /api/bookings` - Create new booking (locks seats for 10 min)
- `GET /api/bookings/:bookingId` - Get booking by ID
- `POST /api/bookings/:bookingId/confirm` - Confirm booking after payment
- `POST /api/bookings/:bookingId/cancel` - Cancel booking
- `GET /api/bookings/all` - Get all bookings (admin)

### Screens

- `GET /api/screens` - Get all screens
- `GET /api/screens/:id` - Get screen by ID
- `POST /api/screens` - Create new screen
- `PUT /api/screens/:id` - Update screen
- `DELETE /api/screens/:id` - Delete screen

## API Response Format

Success:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Seat Locking Logic

1. User selects seats → Creates booking with `status: 'pending'`
2. Seats are locked for 10 minutes (`lockedUntil` timestamp)
3. User completes payment → Booking status changes to `confirmed`
4. If timeout → Booking automatically cancelled, seats released

## Tech Stack

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **express-validator** - Request validation
- **cors** - Cross-origin support
- **dotenv** - Environment configuration
- **node-cron** - Scheduled tasks

## Database Schema

### Movie
- title, description, poster, genres
- duration, rating, releaseDate
- status (now_playing, upcoming, ended)
- showtimes[] (time, screenId, date, availableSeats, price)

### Screen
- name, capacity, rows, seatsPerRow
- screenType (Standard, IMAX, 3D, Dolby, VIP)
- status (active, maintenance, inactive)

### Booking
- bookingId, movieId, screenId
- showtime (time, date)
- seats[] (seatId, row, number)
- customerInfo (name, email, phone)
- status (pending, confirmed, cancelled)
- paymentStatus, lockedUntil, completedAt

## License

MIT
