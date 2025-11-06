import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Profile from "./pages/Profile";
import MovieDetails from "./pages/MovieDetail";

function AppContent() {
    return (
        <div className="min-h-screen bg-base-900 flex flex-col">
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#27272a',
                        color: '#fafafa',
                        border: '1px solid #3f3f46',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fafafa',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fafafa',
                        },
                    },
                }}
            />
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
                                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                                    <p className="text-white/60 mb-6">Page not found</p>
                                    {/* Use Link, not <a>, so routing + scroll control stay in-app */}
                                    <Link to="/" className="btn-primary">Back to Home</Link>
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

export default function App() {
    return (
        <Router>
            <ScrollManager />
            <AppContent />
        </Router>
    );
}
