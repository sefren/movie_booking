# Enhanced Booking System with Screen Details & Pricing

## Overview
The booking system now displays full screen information, pricing based on screen type, and availability for each showtime.

---

## Screen Types & Pricing

### Screen Types Available
1. **Standard** - Base price × 1.0
2. **3D** - Base price × 1.3 (30% premium)
3. **IMAX** - Base price × 1.5 (50% premium)
4. **Dolby** - Base price × 1.4 (40% premium)

### Base Price
- $12.00 per seat
- Final price calculated as: `basePrice × priceMultiplier`

### Example Pricing
- Standard: $12.00
- 3D: $15.60
- IMAX: $18.00
- Dolby: $16.80

---

## Showtime Data Structure

### Backend Response
```json
{
  "success": true,
  "data": {
    "showtimes": [
      {
        "_id": "690b0d35ffee951b3314fe91",
        "movieId": "690b0d35ffee951b3314fe91",
        "screenId": {
          "_id": "690b0d35ffee951b3314fe92",
          "name": "Screen 2",
          "screenType": "IMAX",
          "priceMultiplier": 1.5,
          "totalSeats": 200
        },
        "date": "2025-11-05T00:00:00.000Z",
        "time": "19:00",
        "price": 18.0,
        "availableSeats": 198
      }
    ],
    "groupedByDate": {
      "2025-11-05": [...]
    },
    "count": 25
  }
}
```

### Frontend Formatted Showtime
```javascript
{
  id: "690b0d35ffee951b3314fe91",
  time: "19:00",
  date: Date object,
  screenId: "690b0d35ffee951b3314fe92",
  screenName: "Screen 2",
  screenType: "IMAX",
  priceMultiplier: 1.5,
  totalSeats: 200,
  availableSeats: 198,
  price: 18.0,
  displayTime: "19:00",
  displayDate: "Tue, Nov 5",
  displayScreen: "Screen 2 (IMAX)",
  displayPrice: "$18.00"
}
```

---

## UI Enhancements

### Showtime Button Display

Each showtime button now shows:

```
┌─────────────────────────┐
│  19:00        $18.00    │  ← Time and Price
│  Screen 2               │  ← Screen Name
│  IMAX         198 seats │  ← Screen Type & Availability
└─────────────────────────┘
```

### Visual Indicators

1. **Screen Type Colors**
   - IMAX: Blue highlight
   - Dolby: Purple highlight
   - 3D: Green highlight
   - Standard: Default

2. **Availability Status**
   - Green: 20+ seats available
   - Red: < 20 seats (low availability)
   - Gray: Sold out (disabled button)

3. **Selected State**
   - Dark blue background
   - White text
   - Shadow effect

---

## API Endpoints

### Get Showtimes
```
GET /api/movies/:movieId/showtimes?date=YYYY-MM-DD
```

**Response:**
- `showtimes[]` - Array of all showtimes
- `groupedByDate{}` - Showtimes organized by date
- `count` - Total number of showtimes

**Populated Fields:**
- `screenId.name` - Screen name
- `screenId.screenType` - Screen type (Standard/IMAX/3D/Dolby)
- `screenId.priceMultiplier` - Price multiplier
- `screenId.totalSeats` - Total capacity

---

## Booking Flow with Screen Details

### Step 1: Select Date
- Choose from next 7 days
- Frontend sends: `GET /api/movies/:id/showtimes?date=2025-11-05`

### Step 2: View Available Showtimes
- Displays all showtimes for selected date
- Shows:
  - Time (10:00, 13:00, 16:00, 19:00, 22:00)
  - Screen name & type
  - Price based on screen type
  - Available seats

### Step 3: Select Showtime
- User clicks on desired showtime
- Frontend loads occupied seats for that specific showtime
- Displays seat grid with:
  - Available seats (green/white)
  - Occupied seats (gray)
  - Premium/VIP seats (gold border)

### Step 4: Select Seats
- User selects 1-10 seats
- Price calculated: `numberOfSeats × showtime.price`
- Displays total: `$36.00 (2 seats × $18.00)`

### Step 5: Enter Details & Book
- Fill customer info
- Submit booking
- Backend validates seats aren't already booked
- Creates booking with final price

---

## Database Seeding

### Showtimes Generated
- **14 days** of showtimes
- **5 screens** with different types
- **5 time slots** per day (10:00, 13:00, 16:00, 19:00, 22:00)
- **Total: 350 showtimes** per seeding

### Screen Configuration
```javascript
[
  { name: 'Screen 1', type: 'Standard', priceMultiplier: 1.0, seats: 150 },
  { name: 'Screen 2', type: 'IMAX',     priceMultiplier: 1.5, seats: 200 },
  { name: 'Screen 3', type: '3D',       priceMultiplier: 1.3, seats: 120 },
  { name: 'Screen 4', type: 'Standard', priceMultiplier: 1.0, seats: 96 },
  { name: 'Screen 5', type: 'Dolby',    priceMultiplier: 1.4, seats: 180 }
]
```

---

## Testing

### Run the Test Script
```bash
cd backend && npm run test:booking
```

This will:
1. ✅ Fetch a movie
2. ✅ Get showtimes with screen details
3. ✅ Display screen type and pricing
4. ✅ Check seat availability
5. ✅ Create a booking with correct pricing
6. ✅ Verify seats are locked

### Manual Testing in Browser
1. Go to http://localhost:5173
2. Click any movie → "Book Tickets"
3. Select a date
4. **Observe showtimes showing:**
   - Different screen types (IMAX, 3D, Standard, Dolby)
   - Different prices based on screen type
   - Available seat count
   - Color-coded screen types
5. Select a showtime
6. See correct price in total calculation

---

## Example Calculations

### Standard Screen Booking
- Screen: Standard (1.0x multiplier)
- Base price: $12.00
- Seats selected: 3
- **Total: $36.00**

### IMAX Screen Booking
- Screen: IMAX (1.5x multiplier)
- Base price: $12.00
- Final price: $18.00 per seat
- Seats selected: 3
- **Total: $54.00**

### 3D Screen Booking
- Screen: 3D (1.3x multiplier)
- Base price: $12.00
- Final price: $15.60 per seat
- Seats selected: 3
- **Total: $46.80**

---

## What's Working

✅ **Screen type display** - Shows Standard/IMAX/3D/Dolby
✅ **Dynamic pricing** - Different prices per screen type
✅ **Seat availability** - Real-time available seat count
✅ **Visual indicators** - Color-coded screen types
✅ **Sold out detection** - Disabled buttons for full shows
✅ **Low availability warning** - Red text when < 20 seats
✅ **Correct price calculation** - Total matches screen pricing
✅ **Screen info in booking** - Full details stored in booking record

---

**The booking system now provides complete showtime information with screen details and accurate pricing!** 🎬🎟️💰

