import React from "react";
import { Link } from "react-router-dom";
import { Search, User, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = ({ onSearchChange, searchQuery }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-primary-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/" className="flex items-center">
              <div className="text-xl font-semibold text-primary-900 tracking-tight">
                Cinema
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          {onSearchChange && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-primary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-primary-200 bg-white text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* User Profile - Desktop */}
            <button className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-900 transition-colors duration-200">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary-600 hover:text-primary-900 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-100 py-4 animate-fade-in">
            {/* Mobile Search */}
            {onSearchChange && (
              <div className="px-4 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery || ""}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-primary-200 bg-white text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Mobile Profile */}
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors duration-200 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
