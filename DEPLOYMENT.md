# 🚀 Deployment Guide - Cinema Movie Booking App

## Quick Deployment (20 minutes)

### Step 1: Prepare Your Code (2 minutes)

1. **Run the check script:**
```bash
check-deploy.bat
```
This verifies you have Node.js, Git, and all required files.

2. **Commit your code:**
```bash
prepare-deploy.bat
```
This script will:
- Initialize Git (if needed)
- Show what will be committed  
- Commit your code
- Guide you to push to GitHub

3. **Push to GitHub:**
   - Create a new repository at https://github.com/new
   - Name it: `cinema-booking-app`
   - Don't initialize with README (we have one)
   - Copy the commands shown, or use:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cinema-booking-app.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend to Render (8 minutes)

#### A. Create MongoDB Atlas Database (Free)

1. Go to https://www.mongodb.com/atlas
2. Sign up or log in
3. Click "Build a Database" → Choose "FREE" tier
4. Select a cloud provider and region (closest to you)
5. Name your cluster (e.g., "cinema-cluster")
6. Click "Create"
7. Create a database user:
   - Username: `cinemauser`
   - Password: Generate a secure password (save it!)
8. Add IP Access: Choose "Allow Access from Anywhere" (0.0.0.0/0)
9. Click "Connect" → "Connect your application"
10. Copy the connection string:
```
mongodb+srv://cinemauser:<password>@cluster.mongodb.net/movie-booking
```
Replace `<password>` with your actual password!

#### B. Deploy to Render

1. Go to https://render.com
2. Sign up/Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `cinema-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. **Add Environment Variables:**
   Click "Advanced" → Add these:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-random-long-secret-key-at-least-32-characters
   NODE_ENV=production
   PORT=5000
   TMDB_API_KEY=0e1df6173d5618a099f7706440e2ecc4
   FRONTEND_URL=https://your-app.netlify.app
   ```
   (You'll update FRONTEND_URL later)

7. Click "Create Web Service"
8. Wait for deployment (3-5 minutes)
9. **Copy your backend URL**: `https://cinema-backend-xxxx.onrender.com`

#### C. Seed the Database

1. In Render dashboard, click your service
2. Click "Shell" tab (at the top)
3. Run:
```bash
npm run seed
```
4. Wait for it to complete (2-3 minutes)

---

### Step 3: Deploy Frontend to Netlify (5 minutes)

1. Go to https://app.netlify.com
2. Sign up/Log in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose "Deploy with GitHub"
5. Authorize Netlify to access your repositories
6. Select your `cinema-booking-app` repository
7. Configure build settings:
   - **Build command**: Already set in `netlify.toml`
   - **Publish directory**: Already set in `netlify.toml`
   - Just click "Deploy site"

8. **Add Environment Variables:**
   - Go to "Site settings" → "Environment variables"
   - Click "Add a variable" and add:
   ```
   VITE_API_URL=https://cinema-backend-xxxx.onrender.com/api
   VITE_TMDB_API_KEY=0e1df6173d5618a099f7706440e2ecc4
   VITE_APP_NAME=Cinema
   ```
   Replace the backend URL with YOUR Render URL!

9. **Redeploy with environment variables:**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

10. **Copy your frontend URL**: `https://your-app-name.netlify.app`

---

### Step 4: Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Find `FRONTEND_URL` variable
5. Update it to your Netlify URL: `https://your-app-name.netlify.app`
6. Click "Save Changes" (this will redeploy automatically)

---

## 🎉 You're Live!

Your app should now be accessible at: `https://your-app-name.netlify.app`

Test it:
- ✅ Movies load on homepage
- ✅ Can click on a movie to see details
- ✅ Can book tickets
- ✅ Coming soon movies appear

---

## 🔧 Troubleshooting

### Frontend can't connect to backend

**Problem:** Movies not loading, console shows network errors

**Solutions:**
1. Check `VITE_API_URL` in Netlify includes `/api` at the end
2. Verify backend URL is correct (test it: `https://your-backend.onrender.com/api/health`)
3. Check CORS: Make sure `FRONTEND_URL` in Render matches your Netlify URL exactly
4. Redeploy frontend after changing environment variables

### Backend not starting

**Problem:** Render shows "Deploy failed" or backend crashes

**Solutions:**
1. Check Render logs for errors
2. Verify MongoDB connection string is correct
3. Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
4. Check all environment variables are set correctly

### Movies not loading from database

**Problem:** Frontend works but no movies show

**Solutions:**
1. Make sure you seeded the database (run `npm run seed` in Render shell)
2. Check MongoDB Atlas - verify `movie-booking` database exists with data
3. Check backend logs in Render for database connection errors

### Render free tier issues

**Problem:** Backend is slow or times out

**Info:** Render free tier spins down after 15 minutes of inactivity
- First request after downtime takes 30-60 seconds
- This is normal for free tier
- Consider upgrading to paid tier for production

### Netlify build fails

**Problem:** Deployment fails with build errors

**Solutions:**
1. Make sure all environment variables are set BEFORE building
2. Check that Node version matches (18+)
3. Verify `package.json` has all dependencies
4. Try locally: `npm run build`

---

## 💡 Post-Deployment Tips

### Custom Domain (Optional)

**Netlify:**
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS setup instructions

**Render:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

### Environment Variables Best Practices

- Never commit `.env` files
- Use different API keys for production
- Generate a strong `JWT_SECRET` (32+ characters)
- Use MongoDB Atlas for production (not local MongoDB)

### Monitoring

**Render:**
- Check logs regularly
- Set up alerts for downtime
- Monitor memory/CPU usage

**Netlify:**
- Check deploy logs
- Monitor bandwidth usage
- Review analytics

### Updating Your App

Whenever you push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push
```

Both Netlify and Render will automatically:
- Pull the latest code
- Build
- Deploy

No manual steps needed!

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use strong MongoDB password
- [ ] CORS is configured with exact frontend URL
- [ ] All `.env` files are in `.gitignore`
- [ ] No API keys in code (only in environment variables)
- [ ] MongoDB Atlas restricts access appropriately
- [ ] Test authentication flows
- [ ] Test payment simulation (if enabled)

---

## 🆘 Need More Help?

1. **Render Issues**: https://render.com/docs
2. **Netlify Issues**: https://docs.netlify.com
3. **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## 📊 Free Tier Limitations

### Render (Backend)
- ✅ Free: 750 hours/month
- ✅ Automatic deploys
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM
- Upgrade: $7/month for always-on

### Netlify (Frontend)
- ✅ Free: 100GB bandwidth/month
- ✅ Automatic deploys
- ✅ SSL certificates
- ✅ Always on
- Upgrade: Rarely needed for small apps

### MongoDB Atlas (Database)
- ✅ Free: 512MB storage
- ✅ Shared cluster
- ⚠️ Good for ~10,000 movies + bookings
- Upgrade: $9/month for dedicated

---

## 🎊 Congratulations!

Your cinema booking app is now live and accessible worldwide! 🌍

Share your app URL with friends and enjoy! 🎬🍿

