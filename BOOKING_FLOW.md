# Booking System Flow Documentation

## Overview
The booking system is now fully integrated between frontend and backend with proper data flow.

---

## Backend API Endpoint: `POST /api/bookings`

### Request Format
```json
{
  "showtimeId": "690b0d35ffee951b3314fe91",
  "selectedSeats": [
    {
      "seatId": "A1",
      "row": "A",
      "number": 1,
      "price": 12.0
    },
    {
      "seatId": "A2",
      "row": "A",
      "number": 2,
      "price": 12.0
    }
  ],
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}
```

### What Backend Does Automatically
1. ✅ **Fetches showtime** and populates `movieId` and `screenId`
2. ✅ **Validates seat availability** - checks if seats are already booked
3. ✅ **Calculates total amount** - sums up seat prices
4. ✅ **Creates booking** with status 'confirmed' and generates transaction ID
5. ✅ **Updates available seats** - decrements showtime.availableSeats
6. ✅ **Returns populated booking** with movie, screen, and showtime details

### Response Format
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "690b0d35ffee951b3314fe91",
    "movieId": {
      "title": "The Dark Knight",
      "posterUrl": "https://...",
      "duration": 152
    },
    "screenId": {
      "name": "Screen 1",
      "screenType": "IMAX"
    },
    "showtimeId": {
      "date": "2025-11-05T00:00:00.000Z",
      "time": "19:00",
      "price": 15
    },
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "selectedSeats": [...],
    "totalAmount": 24,
    "status": "confirmed",
    "transactionId": "TXN1730793600123",
    "bookingDate": "2025-11-05T08:40:00.000Z"
  }
}
```

---

## Frontend Booking Flow

### Step 1: User Selects Movie & Showtime
- Navigate to `/booking/:movieId`
- Select date → fetches showtimes
- Select showtime → loads seat availability

### Step 2: Seat Selection
- Fetches occupied seats: `GET /api/bookings/occupied-seats?showtimeId=...`
- User selects available seats
- Total is calculated on frontend

### Step 3: Customer Details
- User fills in name, email, phone
- Form validation runs

### Step 4: Submit Booking
- Frontend sends request to `POST /api/bookings`
- Backend validates, creates booking, updates seats
- Frontend receives booking confirmation

### Step 5: Navigate to Payment
- Booking data stored in localStorage
- Navigate to `/payment`
- User completes payment (mock for now)

---

## Key Features

### ✅ Automatic Seat Locking
- When booking is created, seats are marked as occupied
- Other users can't select those seats

### ✅ Seat Availability Check
- Backend validates seats aren't already booked
- Returns error if seats are unavailable

### ✅ Price Calculation
- Backend calculates total from seat prices
- Uses showtime price as fallback

### ✅ Transaction Tracking
- Unique transaction ID generated: `TXN{timestamp}{random}`
- Can be used for payment tracking

### ✅ Booking Cancellation
- `DELETE /api/bookings/:id`
- Restores available seats in showtime
- Updates booking status to 'cancelled'

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/occupied-seats?showtimeId=...` | Get occupied seats for showtime |
| GET | `/api/bookings/user?email=...` | Get user's bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/bookings/admin/all` | Get all bookings (admin) |

---

## Testing the Booking Flow

### 1. Start Backend & Frontend
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 2. Test Booking
1. Go to http://localhost:5173
2. Click on any movie
3. Click "Book Tickets"
4. Select date & showtime
5. Select seats (1-10)
6. Fill customer details
7. Click "Proceed to Payment"
8. Check console for booking data

### 3. Verify in Database
```bash
cd backend && node scripts/checkDatabase.js
```

---

## What's Working Now

✅ **Movie seeding** - 5 movies with full data
✅ **Showtime generation** - 350 showtimes across 5 screens
✅ **Seat layout** - Each screen has proper seat grid
✅ **Booking creation** - Full integration with validation
✅ **Seat locking** - Occupied seats can't be selected
✅ **Payment flow** - Navigate to payment with booking data

---

## Next Steps (Optional Enhancements)

- 🔐 Add authentication (JWT tokens)
- 💳 Integrate real payment gateway (Stripe/PayPal)
- ⏱️ Add booking expiration (auto-cancel after 10 minutes)
- 📧 Email confirmation for bookings
- 📱 QR code generation for tickets
- 🎟️ Print ticket functionality

---

**The booking system is now fully functional!** 🎬🍿

