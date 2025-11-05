# Cinema Movie Booking App

A full-stack movie booking application with React frontend and Node.js/Express backend.

## 🚀 Features

- Browse movies from TMDB API
- View movie details with trailers, cast, and crew
- Book movie tickets with seat selection
- User authentication and profile management
- Admin panel for managing movies and showtimes
- Coming soon movies section
- Responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:**
- React 19
- React Router v7
- Tailwind CSS
- Vite
- Lucide Icons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- TMDB API Key ([Get it here](https://www.themoviedb.org/settings/api))

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd movie
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables:

**Frontend** - Create `.env` in root:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Cinema
```

**Backend** - Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
TMDB_API_KEY=your_tmdb_api_key
```

4. Run the application:

**Windows:**
```bash
run.bat
```

**Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

5. Seed the database (optional):
```bash
cd backend
npm run seed
```

## 🌐 Deployment

### Quick Start
1. Run `check-deploy.bat` to verify readiness
2. Run `prepare-deploy.bat` to commit to Git
3. Follow instructions in `DEPLOYMENT.md`

### Backend Deployment (Render)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (see DEPLOYMENT.md)

### Frontend Deployment (Netlify)

1. Go to [Netlify](https://netlify.com) and import your GitHub repository
2. Build settings auto-configured via `netlify.toml`
3. Add environment variables in Netlify dashboard
4. Deploy!

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_TMDB_API_KEY=your_api_key
VITE_API_URL=your_backend_url/api
VITE_APP_NAME=Cinema
```

### Backend (backend/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
TMDB_API_KEY=your_api_key
```

## 🗂️ Project Structure

```
movie/
├── backend/              # Backend Node.js API
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Database seed scripts
│   └── server.js        # Entry point
├── src/                 # Frontend React app
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   └── utils/          # Utility functions
├── public/             # Static assets
└── ...config files
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with movies
- `npm run seed:manual` - Manual seed script
- `npm run seed:coming-soon` - Seed coming soon movies

## 🎬 Deployment Scripts

- `check-deploy.bat` - Check if ready for deployment
- `prepare-deploy.bat` - Prepare and commit code for deployment

See `SCRIPTS_GUIDE.md` for detailed usage instructions.

## 📄 License

MIT

## 👨‍💻 Author

Cinema Development Team

