# 🚀 Render Setup Guide - Step by Step

## ✅ Before You Start

Your code is now on GitHub: `https://github.com/sefren/movie_booking`
Your MongoDB Atlas is ready with 100 movies seeded! ✓

---

## 📋 Step-by-Step Render Setup

### Step 1: Go to Render
1. Open your browser
2. Go to: **https://render.com**
3. Click **"Get Started"** or **"Sign Up"**

### Step 2: Sign Up with GitHub
1. Click **"Sign up with GitHub"** (easiest way!)
2. Authorize Render to access your GitHub account
3. You'll be redirected to Render dashboard

### Step 3: Create New Web Service
1. Click the **"New +"** button (top right)
2. Select **"Web Service"**

### Step 4: Connect Your Repository
1. You'll see a list of your repositories
2. Find **"movie_booking"** in the list
3. Click **"Connect"** next to it

   **If you don't see your repo:**
   - Click "Configure account" 
   - Give Render access to your repositories
   - Return and refresh

### Step 5: Configure the Service

Fill in these settings:

**Basic Settings:**
- **Name**: `cinema-backend` (or any name you like)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`, `Frankfurt (EU)`, etc.)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ IMPORTANT!
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** ✓

### Step 6: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these one by one:

#### 1. MONGODB_URI
```
Key: MONGODB_URI
Value: mongodb+srv://manishsharma43005_db_user:gMyDR0WKkPF7wDlp@cluster0.7amjmgl.mongodb.net/movie-booking?retryWrites=true&w=majority&appName=Cluster0
```

#### 2. JWT_SECRET
```
Key: JWT_SECRET
Value: cinema-super-secret-production-key-2024-xyz-abc-def-ghi
```
(Make it long and random for production!)

#### 3. NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### 4. TMDB_API_KEY
```
Key: TMDB_API_KEY
Value: b7feb22e1f27d8f653f8c0af3b79deb3
```

#### 5. FRONTEND_URL
```
Key: FRONTEND_URL
Value: http://localhost:5173
```
(We'll update this after deploying frontend!)

### Step 7: Deploy!
1. Scroll to the bottom
2. Click **"Create Web Service"**
3. Wait for deployment (takes 3-5 minutes)

You'll see:
- Building... ⏳
- Deploying... ⏳
- Live ✅

### Step 8: Get Your Backend URL
Once deployed, you'll see your backend URL at the top:
```
https://cinema-backend-xxxx.onrender.com
```

**COPY THIS URL!** You'll need it for the frontend.

### Step 9: Test Your Backend
1. Click on your backend URL or visit:
   ```
   https://cinema-backend-xxxx.onrender.com/api/health
   ```

2. You should see:
   ```json
   {
     "status": "ok",
     "message": "Movie Booking API is running",
     "timestamp": "2024-..."
   }
   ```

3. Test movies endpoint:
   ```
   https://cinema-backend-xxxx.onrender.com/api/movies
   ```
   
   You should see your 100 movies! 🎬

---

## 🎉 Backend is Live!

Your backend URL: `https://cinema-backend-xxxx.onrender.com`

**Save this URL!** You'll need it for:
1. Netlify frontend deployment
2. Testing your API

---

## 📝 Important Notes

### Free Tier Behavior
- ⚠️ **Render free tier sleeps after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds to wake up
- After waking up, it's fast!
- This is normal for free tier

### If Deployment Fails
Check the **"Logs"** tab in Render to see errors.

Common issues:
1. **Wrong Root Directory**: Make sure it's set to `backend`
2. **Missing Environment Variables**: Double-check all 5 are added
3. **MongoDB Connection**: Verify your connection string is correct

---

## ✅ Next Step: Deploy Frontend to Netlify

Once your backend is live and tested, move to deploying the frontend!

**Your Backend URL**: `https://cinema-backend-xxxx.onrender.com`

You'll use this in Netlify as:
```
VITE_API_URL=https://cinema-backend-xxxx.onrender.com/api
```
(Note the `/api` at the end!)

---

## 🔧 Environment Variables Quick Reference

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (32+ characters) |
| `NODE_ENV` | `production` |
| `TMDB_API_KEY` | Your TMDB API key |
| `FRONTEND_URL` | Will update after Netlify deployment |

---

## 📊 Monitoring Your Backend

In Render dashboard, you can:
- ✅ View **Logs** (real-time)
- ✅ Check **Metrics** (CPU, Memory)
- ✅ See **Events** (deployments, restarts)
- ✅ Update **Environment Variables** anytime

---

## 🚀 Ready for Frontend?

Once you see your backend is live at:
```
https://cinema-backend-xxxx.onrender.com/api/movies
```

You're ready to deploy the frontend to Netlify!

Let me know your backend URL and I'll help you set up Netlify! 🎬

