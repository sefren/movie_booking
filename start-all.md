# 🚀 How to Run the Complete Application

## Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: movie-booking
🚀 Server running on port 5000
🌐 API URL: http://localhost:5000
```

**Keep this terminal running!**

## Step 2: Start Frontend (Terminal 2)

Open a NEW terminal window and run:

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 3: Open Browser

Open your browser and go to: **http://localhost:5173**

You should see the movie booking app!

## What's Running:

✅ **Backend API** → http://localhost:5000
✅ **Frontend App** → http://localhost:5173
✅ **MongoDB** → localhost:27017

## Quick Test Backend:

In another terminal, test the API:

```bash
# Get all movies
curl http://localhost:5000/api/movies

# Get all screens
curl http://localhost:5000/api/screens
```

## What You Should See:

The app currently shows movies from TMDB (or mock data). 

**Next step:** We need to connect the frontend to use the backend API instead!

Would you like me to update the frontend to use the real backend with:
- Real movie data from database
- Real showtimes per screen
- Real seat booking
- Real-time seat availability?
