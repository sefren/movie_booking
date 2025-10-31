import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import { useState } from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header onSearchChange={handleSearchChange} searchQuery={searchQuery} />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                />
              }
            />
            <Route path="/movie/:id" element={<Booking />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-white flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary-900 mb-4">
                      404
                    </h1>
                    <p className="text-primary-600 mb-6">Page not found</p>
                    <a href="/" className="btn-primary">
                      Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
