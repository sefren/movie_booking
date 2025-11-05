# 🚀 Quick Deploy Scripts

## Available Scripts

### 1. `check-deploy.bat` - Check if ready for deployment
```bash
check-deploy.bat
```
**What it does:**
- ✅ Checks if Node.js, npm, and Git are installed
- ✅ Verifies all required files exist
- ✅ Checks for sensitive files that shouldn't be committed
- ✅ Shows current Git status

**Run this first to see if you're ready!**

---

### 2. `prepare-deploy.bat` - Prepare and commit for deployment
```bash
prepare-deploy.bat
```
**What it does:**
- ✅ Initializes Git repository (if needed)
- ✅ Creates/checks .gitignore
- ✅ Warns about sensitive files (.env)
- ✅ Shows what will be committed
- ✅ Commits all files with your message
- ✅ Optionally pushes to GitHub

**Run this to prepare your code for deployment!**

---

## 📋 Quick Deployment Checklist

### Before Running Scripts:
- [ ] Make sure your app works locally (`run.bat`)
- [ ] Create `.env.example` with template values (no real secrets)
- [ ] Read `DEPLOYMENT.md` for full instructions

### Step 1: Check Readiness
```bash
check-deploy.bat
```

### Step 2: Prepare & Commit
```bash
prepare-deploy.bat
```

### Step 3: Push to GitHub
If not done automatically:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy Backend (Render)
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_random_secret_key
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-url.netlify.app
   TMDB_API_KEY=your_tmdb_api_key
   ```

### Step 5: Deploy Frontend (Netlify)
1. Go to https://app.netlify.com
2. New site from Git → Select your repo
3. Settings are auto-detected from `netlify.toml`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com/api
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_APP_NAME=Cinema
   ```

### Step 6: Update Backend CORS
Go back to Render and update `FRONTEND_URL` to your actual Netlify URL

---

## 🔧 Troubleshooting

### "Git not found"
Install Git: https://git-scm.com/download/win

### "No changes to commit"
Everything is already committed! Check with:
```bash
git status
```

### "Remote repository not configured"
First create a repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### "Push failed"
Make sure you've:
1. Created the repository on GitHub
2. Set up remote correctly
3. Have internet connection

---

## 📖 Full Documentation

- **README.md** - Project overview and local setup
- **DEPLOYMENT.md** - Detailed deployment instructions
- **GIT_CHECKLIST.md** - What files to commit

---

## 💡 Tips

- Run `check-deploy.bat` anytime to verify your setup
- Use `prepare-deploy.bat` whenever you want to commit changes
- Both scripts have colored output and clear instructions
- They won't commit sensitive files (protected by .gitignore)

---

**Need help? Check DEPLOYMENT.md for step-by-step instructions!**

