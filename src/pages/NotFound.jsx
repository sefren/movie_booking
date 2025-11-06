import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-base-900 flex items-center justify-center px-4 py-20">
            <div className="max-w-2xl w-full text-center">
                {/* Main 404 Display */}
                <div className="mb-12">
                    <div className="inline-block mb-6">
                        <div className="w-1 h-16 bg-cinema-red mx-auto mb-4"></div>
                    </div>
                    <h1 className="text-8xl md:text-9xl font-bold text-white mb-6 tracking-tight">
                        404
                    </h1>
                    <p className="text-xl text-text-muted mb-2">Page Not Found</p>
                    <p className="text-sm text-text-muted/60 max-w-md mx-auto leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
                    <Link to="/" className="btn-primary w-full sm:w-auto">
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary w-full sm:w-auto"
                    >
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="border-t border-surface-border pt-8">
                    <p className="text-xs text-text-muted/60 mb-4 uppercase tracking-wider">Quick Links</p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link to="/" className="text-text-muted hover:text-cinema-red transition-colors">
                            Now Showing
                        </Link>
                        <Link to="/" className="text-text-muted hover:text-cinema-red transition-colors">
                            Coming Soon
                        </Link>
                        <Link to="/profile" className="text-text-muted hover:text-cinema-red transition-colors">
                            My Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

