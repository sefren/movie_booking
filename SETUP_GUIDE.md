# 🎬 Movie Booking App - Complete Setup Guide

## ✅ What's Implemented

### Frontend (React + Vite + Tailwind)
- ✅ Movie browsing with TMDB API integration
- ✅ Search and filter by genre
- ✅ Pagination for upcoming movies
- ✅ Seat selection grid (8x12 layout)
- ✅ Booking form with validation
- ✅ Payment simulation
- ✅ Responsive design
- ✅ Mock data fallback (works without API key)

### Backend (Node.js + Express + MongoDB)
- ✅ RESTful API with CRUD operations
- ✅ MongoDB schemas: Movie, Screen, Booking
- ✅ **Seat locking** with 10-minute reservation
- ✅ **Atomic transactions** using Mongoose sessions
- ✅ **Multiple screens** (Standard, IMAX, 3D)
- ✅ **Dynamic showtimes** per movie
- ✅ Real-time occupied seats tracking
- ✅ Booking management (create, confirm, cancel)

## 🚀 Quick Start

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `backend/.env` with your connection string

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (already done)
npm install

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend will run on: http://localhost:5000

### 3. Setup Frontend

```bash
# In a new terminal, navigate to project root
cd movie-booking

# Install dependencies (already done)
npm install

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### 4. Test the App

Open http://localhost:5173 in your browser!

## 📊 Database Structure

### Screens (3 screens created)
- **Screen 1** - Standard (96 seats)
- **Screen 2** - IMAX (96 seats)
- **Screen 3** - 3D (72 seats)

### Movies (3 movies with showtimes)
- The Dark Knight
- Inception
- Interstellar

Each movie has:
- **5 showtimes per day**: 10:00 AM, 1:30 PM, 4:00 PM, 7:00 PM, 10:30 PM
- **7 days of shows**
- **Different screens** for each showtime

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_TMDB_API_KEY=your_api_key_here (optional - has fallback)
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Next Steps: Connect Frontend to Backend

Currently, the frontend uses mock data. To connect it to the real backend:

1. Update frontend API calls to use `http://localhost:5000/api`
2. Replace TMDB API calls with backend movie endpoints
3. Implement real seat booking flow
4. Add real-time seat updates

Would you like me to:
1. Connect frontend to backend?
2. Add real-time features with WebSockets?
3. Implement user authentication?
4. Add payment gateway integration?

## 📝 API Testing

Test backend endpoints with curl or Postman:

```bash
# Get all movies
curl http://localhost:5000/api/movies

# Get movie with showtimes
curl http://localhost:5000/api/movies/:id/showtimes

# Get occupied seats
curl "http://localhost:5000/api/bookings/occupied-seats?movieId=xxx&date=2024-01-01"

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"movieId": "xxx", "seats": [...], ...}'
```

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Make sure MongoDB is running
- Check connection string in backend/.env

**Port Already in Use**
- Change PORT in backend/.env
- Or kill process: `npx kill-port 5000`

**Frontend White Screen**
- Check browser console for errors
- Try hard refresh: Ctrl + Shift + R

## 📚 Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

**Backend:**
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

## ✨ Features Checklist

### ✅ Completed
- [x] Browse & Search movies
- [x] Genre filtering
- [x] Seat selection UI
- [x] Booking form
- [x] Payment simulation
- [x] Backend API
- [x] Database schemas
- [x] Seat locking
- [x] Multiple screens
- [x] Dynamic showtimes
- [x] Transaction management

### 🔄 Ready to Implement
- [ ] Connect frontend to backend
- [ ] Real-time seat updates
- [ ] User authentication
- [ ] Booking history
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Admin dashboard

Let me know which feature you'd like to implement next!
