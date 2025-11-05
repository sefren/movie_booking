import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Profile from "./pages/Profile";
import MovieDetails from "./pages/MovieDetail";

function AppContent() {
  return (
    <div className="min-h-screen bg-base-900 flex flex-col">
      <Header showSearch={true} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    404
                  </h1>
                  <p className="text-white/60 mb-6">Page not found</p>
                  <a href="/" className="btn-primary">
                    Back to Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
