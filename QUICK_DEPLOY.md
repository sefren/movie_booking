# 🚀 Quick MongoDB Atlas + Deployment Guide

## Step 1: Get MongoDB Atlas (5 minutes)

### A. Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub (easiest) or email
3. Click "Build a Database"

### B. Choose Free Tier
1. Select **"M0 FREE"** (says "Shared" or "Free")
2. Provider: Choose **AWS** (or any)
3. Region: Choose closest to you
4. Cluster Name: `cinema-cluster` (or keep default)
5. Click **"Create"**

### C. Create Database User
1. You'll see "Security Quickstart"
2. **Username**: `cinemauser`
3. **Password**: Click "Autogenerate Secure Password" 
4. **COPY THE PASSWORD!** Save it somewhere safe!
5. Click "Create User"

### D. Allow Access
1. You'll see "Where would you like to connect from?"
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. Also add: **"0.0.0.0/0"** (for deployment)
   - This allows Render to connect
5. Click "Finish and Close"

### E. Get Connection String
1. Click "Connect" button
2. Choose **"Connect your application"**
3. Driver: **Node.js**
4. Copy the connection string that looks like:
```
mongodb+srv://cinemauser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **IMPORTANT**: Replace `<password>` with the actual password you copied!
6. Add database name at the end:
```
mongodb+srv://cinemauser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render (8 minutes)

### A. Commit Your Code
```bash
.\prepare-deploy.bat
```
Follow the prompts, then push to GitHub:
```bash
git push
```

### B. Deploy to Render
1. Go to: https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Connect your repository**: `sefren/movie_booking`
5. Configure:
   - **Name**: `cinema-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`
   - **Instance Type**: `Free`

6. Click **"Advanced"** and add Environment Variables:

```env
MONGODB_URI=mongodb+srv://cinemauser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority
JWT_SECRET=cinema-super-secret-key-2024-production-xyz
NODE_ENV=production
PORT=5000
TMDB_API_KEY=b7feb22e1f27d8f653f8c0af3b79deb3
FRONTEND_URL=https://your-app.netlify.app
```

(You'll update FRONTEND_URL after deploying frontend)

7. Click **"Create Web Service"**

8. Wait 3-5 minutes for deployment

9. **COPY YOUR BACKEND URL**: 
   - Example: `https://cinema-backend-xxxx.onrender.com`

### C. Seed the Database
1. In Render, click your service
2. Go to **"Shell"** tab
3. Run:
```bash
npm run seed
```
4. Wait 2-3 minutes for movies to load

---

## Step 3: Deploy Frontend to Netlify (5 minutes)

### A. Deploy Site
1. Go to: https://app.netlify.com
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub**
5. Select repository: `sefren/movie_booking`
6. Settings auto-detected from `netlify.toml`
7. Click **"Deploy site"**

### B. Add Environment Variables
1. Go to **"Site settings"** → **"Environment variables"**
2. Click **"Add a variable"** for each:

```env
VITE_API_URL=https://cinema-backend-xxxx.onrender.com/api
VITE_TMDB_API_KEY=0e1df6173d5618a099f7706440e2ecc4
VITE_APP_NAME=Cinema
```

**IMPORTANT**: Replace `cinema-backend-xxxx.onrender.com` with YOUR actual Render URL!

3. Click **"Save"**

### C. Redeploy
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

4. **COPY YOUR NETLIFY URL**:
   - Example: `https://your-app-abc123.netlify.app`

---

## Step 4: Connect Frontend & Backend (2 minutes)

### Update Backend CORS
1. Go back to **Render** dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Find **FRONTEND_URL**
5. Update to: `https://your-app-abc123.netlify.app`
6. Click **"Save Changes"**
7. Wait for auto-redeploy (1-2 minutes)

---

## 🎉 YOU'RE LIVE!

Visit your Netlify URL: `https://your-app-abc123.netlify.app`

### Test it:
- ✅ Movies should load
- ✅ Click on a movie to see details
- ✅ Book tickets should work
- ✅ Trailers should play

---

## 📝 Save These URLs!

**Frontend (Netlify)**: https://your-app-abc123.netlify.app
**Backend (Render)**: https://cinema-backend-xxxx.onrender.com
**Database**: MongoDB Atlas cluster

---

## 🐛 Troubleshooting

### Movies not loading?
1. Check browser console (F12)
2. Verify `VITE_API_URL` in Netlify includes `/api` at end
3. Test backend: Visit `https://your-backend.onrender.com/api/health`

### Backend slow on first load?
- Normal! Render free tier sleeps after 15 min
- First request takes 30-60 seconds
- Then it's fast

### Can't connect to MongoDB?
1. Check password in connection string
2. Make sure you added 0.0.0.0/0 to IP whitelist
3. Verify connection string ends with `/movie-booking`

---

## 💰 Costs

- **MongoDB Atlas**: FREE (512MB)
- **Render Backend**: FREE (sleeps after 15 min)
- **Netlify Frontend**: FREE (100GB bandwidth)

**Total: $0/month** 🎊

---

## 🔄 Future Updates

To update your deployed app:
```bash
git add .
git commit -m "Your update"
git push
```

Both Netlify and Render will auto-deploy! ✨

