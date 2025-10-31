#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Fancy banner
print_banner() {
    clear
    echo -e "${MAGENTA}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║           🎬  MOVIE BOOKING SYSTEM SETUP  🎬                  ║"
    echo "║                                                               ║"
    echo "║              Complete Cinema Ticket Booking                  ║"
    echo "║          with Real-time Seat Locking & Payments              ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Print step header
print_step() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Print info message
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Spinner animation
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_banner

# Step 1: Check Prerequisites
print_step "Step 1: Checking Prerequisites"

if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed"
    print_info "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check MongoDB
print_info "Checking MongoDB..."
if command_exists mongod; then
    print_success "MongoDB is installed"
elif command_exists mongo; then
    print_success "MongoDB client is installed"
else
    print_warning "MongoDB command not found in PATH"
    print_info "Checking if MongoDB service is running..."
fi

# Try to check MongoDB service on Windows
if net start 2>&1 | grep -i "MongoDB" > /dev/null; then
    print_success "MongoDB service is running"
else
    print_warning "Cannot verify MongoDB status"
    print_info "Make sure MongoDB is installed and running"
fi

echo ""
sleep 1

# Step 2: Install Dependencies
print_step "Step 2: Installing Dependencies"

print_info "Installing frontend dependencies..."
npm install > /dev/null 2>&1 &
spinner $!
print_success "Frontend dependencies installed"

echo ""
print_info "Installing backend dependencies..."
cd backend
npm install > /dev/null 2>&1 &
spinner $!
cd ..
print_success "Backend dependencies installed"

echo ""
sleep 1

# Step 3: Database Setup
print_step "Step 3: Setting Up Database"

print_info "Seeding database with movies, screens, and showtimes..."
cd backend
npm run seed 2>&1 | grep -E "(✅|📊|🎬|⏰)" | while read line; do
    echo -e "${GREEN}  $line${NC}"
done
cd ..

print_success "Database seeded successfully!"
echo ""
sleep 1

# Step 4: Configuration
print_step "Step 4: Configuration Summary"

echo -e "${WHITE}Backend Configuration:${NC}"
echo -e "  ${CYAN}→${NC} API running on: ${GREEN}http://localhost:5000${NC}"
echo -e "  ${CYAN}→${NC} Database: ${GREEN}MongoDB (localhost:27017)${NC}"
echo ""

echo -e "${WHITE}Frontend Configuration:${NC}"
echo -e "  ${CYAN}→${NC} App running on: ${GREEN}http://localhost:5173${NC}"
echo -e "  ${CYAN}→${NC} Backend API: ${GREEN}http://localhost:5000/api${NC}"
echo ""

echo -e "${WHITE}Database Contents:${NC}"
echo -e "  ${CYAN}→${NC} ${GREEN}3${NC} Screens (Standard, IMAX, 3D)"
echo -e "  ${CYAN}→${NC} ${GREEN}3${NC} Movies (Dark Knight, Inception, Interstellar)"
echo -e "  ${CYAN}→${NC} ${GREEN}5${NC} Showtimes per day across different screens"
echo -e "  ${CYAN}→${NC} ${GREEN}7${NC} Days of shows available"
echo ""
sleep 2

# Step 5: Start Services
print_step "Step 5: Starting Services"

print_info "This will open 2 terminal windows:"
echo -e "  ${CYAN}1.${NC} Backend Server (Port 5000)"
echo -e "  ${CYAN}2.${NC} Frontend Dev Server (Port 5173)"
echo ""

read -p "$(echo -e ${YELLOW}"Press ENTER to start the servers..."${NC})" 

# Detect OS and start terminals
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    print_info "Starting backend server..."
    start "Movie Booking - Backend" cmd /k "cd backend && npm run dev"
    sleep 2
    
    print_info "Starting frontend server..."
    start "Movie Booking - Frontend" cmd /k "npm run dev"
else
    # Mac/Linux
    print_info "Starting backend server..."
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "cd backend && npm run dev; exec bash"
    elif command_exists xterm; then
        xterm -e "cd backend && npm run dev" &
    else
        echo "Please run: cd backend && npm run dev"
    fi
    
    sleep 2
    print_info "Starting frontend server..."
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "npm run dev; exec bash"
    elif command_exists xterm; then
        xterm -e "npm run dev" &
    else
        echo "Please run: npm run dev"
    fi
fi

sleep 3
echo ""

# Success Message
print_banner
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║                  ✨  SETUP COMPLETE!  ✨                      ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${WHITE}🌐 Your application is now running!${NC}"
echo ""
echo -e "${CYAN}Frontend:${NC}  ${GREEN}http://localhost:5173${NC}"
echo -e "${CYAN}Backend:${NC}   ${GREEN}http://localhost:5000${NC}"
echo -e "${CYAN}Database:${NC}  ${GREEN}MongoDB on localhost:27017${NC}"
echo ""

echo -e "${WHITE}📚 Features Available:${NC}"
echo -e "  ${GREEN}✓${NC} Browse movies in theaters"
echo -e "  ${GREEN}✓${NC} Multiple screens with different showtimes"
echo -e "  ${GREEN}✓${NC} Real-time seat selection"
echo -e "  ${GREEN}✓${NC} Seat locking (10-minute reservation)"
echo -e "  ${GREEN}✓${NC} Booking management"
echo -e "  ${GREEN}✓${NC} Payment simulation"
echo ""

echo -e "${YELLOW}📝 Test Booking Flow:${NC}"
echo -e "  ${CYAN}1.${NC} Select a movie"
echo -e "  ${CYAN}2.${NC} Choose date, time, and screen"
echo -e "  ${CYAN}3.${NC} Select seats (max 8)"
echo -e "  ${CYAN}4.${NC} Fill customer info"
echo -e "  ${CYAN}5.${NC} Complete payment"
echo ""

echo -e "${WHITE}🔧 Quick Commands:${NC}"
echo -e "  ${CYAN}• Reseed database:${NC}    cd backend && npm run seed"
echo -e "  ${CYAN}• Restart backend:${NC}     cd backend && npm run dev"
echo -e "  ${CYAN}• Restart frontend:${NC}    npm run dev"
echo ""

echo -e "${MAGENTA}Happy Booking! 🎬🍿${NC}"
echo ""

