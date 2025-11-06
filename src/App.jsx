import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImageLoadingProvider } from "./contexts/ImageLoadingContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Profile from "./pages/Profile";
import MovieDetails from "./pages/MovieDetail";
import NotFound from "./pages/NotFound";

function AppContent() {
    return (
        <ImageLoadingProvider delay={150}>
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
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </ImageLoadingProvider>
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
