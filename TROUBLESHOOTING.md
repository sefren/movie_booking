# Troubleshooting: Frontend Not Showing Screen Details

## Quick Diagnostics

### Step 1: Test Backend API
Run this command to verify the backend is returning correct data:

```cmd
cd D:\Dev\web\movie\backend && npm run test:showtimes
```

**Expected output:**
- ✅ Shows showtimes with screen details
- ✅ Each showtime has: screenId.name, screenId.screenType, screenId.priceMultiplier
- ✅ Prices are calculated correctly

**If it fails:**
- Backend might not be running → Start it: `npm run dev`
- No showtimes in database → Run seeder: `npm run seed:manual`

---

### Step 2: Check Browser Console

1. Open browser (http://localhost:5173)
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Click on a movie → "Book Tickets"
5. Look for errors

**Common errors:**
- `Failed to fetch showtimes` → Backend not running
- `showtimes.map is not a function` → Data format issue
- CORS error → Backend CORS not configured

---

### Step 3: Hard Refresh Browser

The browser might be caching old code:

**Windows/Linux:**
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

---

### Step 4: Restart Servers

Stop both servers (Ctrl+C) and restart:

```cmd
# Terminal 1 - Backend
cd D:\Dev\web\movie\backend
npm run dev

# Terminal 2 - Frontend
cd D:\Dev\web\movie
npm run dev
```

---

## Common Issues & Fixes

### Issue 1: "No showtimes available"

**Cause:** Database doesn't have showtimes for selected date

**Fix:**
```cmd
cd D:\Dev\web\movie\backend
npm run seed:manual
```

This seeds:
- 5 movies
- 5 screens (Standard, IMAX, 3D, Dolby)
- 350 showtimes for next 14 days

---

### Issue 2: Showtimes showing but no screen info

**Cause:** Backend not populating screenId

**Check:** Look in browser console for the showtime object:
```javascript
console.log('Showtime:', selectedShowtime);
```

**Should see:**
```javascript
{
  id: "...",
  time: "19:00",
  screenName: "Screen 2",      // ✅ Should be present
  screenType: "IMAX",           // ✅ Should be present
  price: 18.0,                  // ✅ Should be present
  availableSeats: 198
}
```

**If screenName/screenType are "Unknown":**
- Backend populate() might have failed
- Restart backend server

---

### Issue 3: Prices all show $12.00

**Cause:** Screen priceMultiplier not being applied

**Check database:**
```cmd
cd D:\Dev\web\movie\backend
node scripts/checkDatabase.js
```

Look for screens with different priceMultipliers:
- Standard: 1.0
- 3D: 1.3
- IMAX: 1.5
- Dolby: 1.4

**If all 1.0:**
- Re-run seeder: `npm run seed:manual`

---

### Issue 4: Old code still running

**Symptoms:**
- Showtime buttons look different than expected
- Missing price display
- Missing screen type colors

**Fix:**
1. Stop frontend (Ctrl+C)
2. Clear node_modules cache:
   ```cmd
   cd D:\Dev\web\movie
   rm -rf node_modules/.vite
   ```
3. Restart:
   ```cmd
   npm run dev
   ```
4. Hard refresh browser (Ctrl+Shift+R)

---

## Verify Code Changes

### Check Booking.jsx has updated showtime buttons:

Open `src/pages/Booking.jsx` and search for:
```javascript
<div className="flex items-center justify-between mb-1">
  <div className="font-bold text-sm sm:text-base md:text-lg">
    {showtime.time}
  </div>
  <div className="font-semibold text-xs sm:text-sm">
    ${showtime.price?.toFixed(2)}
  </div>
</div>
```

**If you don't see this:**
- The file wasn't saved
- You're editing a different file
- Git might have reverted changes

---

### Check backend movieController.js has updated response:

Open `backend/controllers/movieController.js` and search for:
```javascript
res.json({
    success: true,
    data: {
        showtimes,
        groupedByDate,
        count: showtimes.length
    }
});
```

**If you see `data: showtimes` instead:**
- The backend wasn't updated
- You need to save the file
- Nodemon might not have restarted

---

## Test API Directly

### Open in browser:
```
http://localhost:5000/api/movies
```

**Should show:**
- List of movies

### Then test showtimes (replace MOVIE_ID):
```
http://localhost:5000/api/movies/MOVIE_ID/showtimes?date=2025-11-05
```

**Should show:**
```json
{
  "success": true,
  "data": {
    "showtimes": [
      {
        "_id": "...",
        "time": "19:00",
        "price": 18,
        "screenId": {
          "name": "Screen 2",
          "screenType": "IMAX",
          "priceMultiplier": 1.5
        }
      }
    ]
  }
}
```

---

## Still Not Working?

### Get detailed logs:

1. **Backend logs:**
   ```cmd
   cd D:\Dev\web\movie\backend
   npm run dev
   ```
   Watch for errors when you load the booking page

2. **Frontend logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for red errors
   - Copy error message

3. **Network tab:**
   - Open DevTools → Network tab
   - Load booking page
   - Look for `/showtimes` request
   - Click on it → Preview tab
   - Check if `data.showtimes` exists

---

## Emergency Reset

If nothing works, reset everything:

```cmd
# 1. Stop all servers (Ctrl+C)

# 2. Clear database and reseed
cd D:\Dev\web\movie\backend
npm run seed:manual

# 3. Restart backend
npm run dev

# 4. In new terminal, restart frontend
cd D:\Dev\web\movie
npm run dev

# 5. Hard refresh browser
# Press Ctrl+Shift+R
```

---

## Quick Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] Database has movies and showtimes (`node scripts/checkDatabase.js`)
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal
- [ ] `test:showtimes` script passes

**If all checked and still broken:**
- Share the browser console error
- Share the backend terminal output
- Run `npm run test:showtimes` and share output

