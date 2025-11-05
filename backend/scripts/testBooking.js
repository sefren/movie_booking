import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testBookingFlow() {
    console.log('🧪 Testing Booking Flow\n');
    console.log('='.repeat(50));

    try {
        // Step 1: Get a movie
        console.log('\n📽️  Step 1: Fetching movies...');
        const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
        const movies = moviesResponse.data.data.movies;
        console.log(`✓ Found ${movies.length} movies`);
        const testMovie = movies[0];
        console.log(`✓ Using: ${testMovie.title}`);

        // Step 2: Get showtimes for the movie
        console.log('\n🎬 Step 2: Fetching showtimes...');
        const today = new Date().toISOString().split('T')[0];
        const showtimesResponse = await axios.get(`${API_BASE_URL}/movies/${testMovie._id}/showtimes?date=${today}`);
        const showtimes = showtimesResponse.data.data;
        console.log(`✓ Found ${showtimes.length} showtimes`);

        if (showtimes.length === 0) {
            console.log('⚠️  No showtimes available for today');
            return;
        }

        const testShowtime = showtimes[0];
        console.log(`✓ Using showtime: ${testShowtime.time} at ${testShowtime.screenId.name}`);

        // Step 3: Check occupied seats
        console.log('\n💺 Step 3: Checking seat availability...');
        const seatsResponse = await axios.get(`${API_BASE_URL}/bookings/occupied-seats?showtimeId=${testShowtime._id}`);
        const occupiedSeats = seatsResponse.data.data;
        console.log(`✓ Occupied seats: ${occupiedSeats.length}`);

        // Step 4: Create a test booking
        console.log('\n📝 Step 4: Creating test booking...');
        const bookingRequest = {
            showtimeId: testShowtime._id,
            selectedSeats: [
                { seatId: 'A1', row: 'A', number: 1, price: testShowtime.price },
                { seatId: 'A2', row: 'A', number: 2, price: testShowtime.price }
            ],
            customerName: 'Test User',
            customerEmail: 'test@example.com',
            customerPhone: '+1234567890'
        };

        console.log('Request:', JSON.stringify(bookingRequest, null, 2));

        const bookingResponse = await axios.post(`${API_BASE_URL}/bookings`, bookingRequest);
        const booking = bookingResponse.data.data;

        console.log('\n✅ Booking created successfully!');
        console.log('Booking ID:', booking._id);
        console.log('Transaction ID:', booking.transactionId);
        console.log('Total Amount: $' + booking.totalAmount);
        console.log('Status:', booking.status);
        console.log('Customer:', booking.customerName);
        console.log('Seats:', booking.selectedSeats.map(s => s.seatId).join(', '));

        // Step 5: Verify seats are now occupied
        console.log('\n🔒 Step 5: Verifying seats are locked...');
        const seatsAfterResponse = await axios.get(`${API_BASE_URL}/bookings/occupied-seats?showtimeId=${testShowtime._id}`);
        const occupiedSeatsAfter = seatsAfterResponse.data.data;
        console.log(`✓ Occupied seats now: ${occupiedSeatsAfter.length} (was ${occupiedSeats.length})`);
        console.log('✓ Newly occupied:', occupiedSeatsAfter.filter(s => !occupiedSeats.includes(s)).join(', '));

        // Step 6: Get booking details
        console.log('\n📋 Step 6: Fetching booking details...');
        const bookingDetailsResponse = await axios.get(`${API_BASE_URL}/bookings/${booking._id}`);
        const bookingDetails = bookingDetailsResponse.data.data;
        console.log('✓ Booking retrieved successfully');
        console.log('Movie:', bookingDetails.movieId.title);
        console.log('Screen:', bookingDetails.screenId.name, `(${bookingDetails.screenId.screenType})`);
        console.log('Showtime:', new Date(bookingDetails.showtimeId.date).toLocaleDateString(), bookingDetails.showtimeId.time);

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests passed! Booking system is working perfectly!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Check if backend is running first
async function checkBackend() {
    try {
        const response = await axios.get('http://localhost:5000');
        console.log('✓ Backend is running:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Backend is not running!');
        console.error('Please start the backend first: cd backend && npm run dev');
        return false;
    }
}

async function run() {
    const isRunning = await checkBackend();
    if (isRunning) {
        await testBookingFlow();
    }
}

run();

