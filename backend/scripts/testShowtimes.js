import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testShowtimeAPI() {
    console.log('🧪 Testing Showtime API with Screen Details\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Get a movie
        console.log('\n📽️  Step 1: Fetching movies...');
        const moviesResponse = await axios.get(`${API_BASE_URL}/movies`);
        const movies = moviesResponse.data.data.movies;
        const testMovie = movies[0];
        console.log(`✓ Using: ${testMovie.title} (ID: ${testMovie._id})`);

        // Step 2: Get showtimes with today's date
        console.log('\n🎬 Step 2: Fetching showtimes for today...');
        const today = new Date().toISOString().split('T')[0];
        console.log(`Date: ${today}`);

        const showtimesResponse = await axios.get(
            `${API_BASE_URL}/movies/${testMovie._id}/showtimes?date=${today}`
        );

        const data = showtimesResponse.data;
        console.log('\n📊 Response Structure:');
        console.log(`- success: ${data.success}`);
        console.log(`- data.showtimes: ${Array.isArray(data.data?.showtimes) ? 'Array' : 'NOT AN ARRAY!'}`);
        console.log(`- data.count: ${data.data?.count}`);

        if (!data.data?.showtimes || data.data.showtimes.length === 0) {
            console.log('\n⚠️  No showtimes found for today!');
            console.log('This might be because:');
            console.log('1. No showtimes exist for today in the database');
            console.log('2. The date range in the seeder is in the past');
            console.log('\nTrying to get all showtimes without date filter...\n');

            const allShowtimesResponse = await axios.get(
                `${API_BASE_URL}/movies/${testMovie._id}/showtimes`
            );
            const allShowtimes = allShowtimesResponse.data.data.showtimes;
            console.log(`✓ Found ${allShowtimes.length} showtimes total`);

            if (allShowtimes.length > 0) {
                const firstShowtime = allShowtimes[0];
                console.log('\n📅 First available showtime:');
                console.log(`Date: ${new Date(firstShowtime.date).toLocaleDateString()}`);
                console.log(`Time: ${firstShowtime.time}`);
            }
        }

        const showtimes = data.data.showtimes || [];
        console.log(`\n✓ Found ${showtimes.length} showtimes for today`);

        if (showtimes.length > 0) {
            console.log('\n🎯 Sample Showtime Details:');
            const sample = showtimes[0];
            console.log('─'.repeat(60));
            console.log(`Time: ${sample.time}`);
            console.log(`Price: $${sample.price}`);
            console.log(`Available Seats: ${sample.availableSeats}`);

            if (sample.screenId) {
                console.log('\n🖥️  Screen Details:');
                console.log(`  Name: ${sample.screenId.name}`);
                console.log(`  Type: ${sample.screenId.screenType}`);
                console.log(`  Price Multiplier: ${sample.screenId.priceMultiplier}x`);
                console.log(`  Total Seats: ${sample.screenId.totalSeats}`);
            } else {
                console.log('\n❌ Screen details NOT populated!');
            }
            console.log('─'.repeat(60));

            // Show all showtimes summary
            console.log('\n📋 All Showtimes Summary:');
            showtimes.forEach((st, index) => {
                const screenType = st.screenId?.screenType || 'Unknown';
                const price = st.price?.toFixed(2) || '0.00';
                const seats = st.availableSeats || 0;
                console.log(`${index + 1}. ${st.time} - ${screenType} - $${price} - ${seats} seats`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ API is working correctly!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('\nResponse status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Check backend first
async function checkBackend() {
    try {
        await axios.get('http://localhost:5000');
        console.log('✓ Backend is running\n');
        return true;
    } catch (error) {
        console.error('❌ Backend is not running!');
        console.error('Start it with: cd backend && npm run dev');
        return false;
    }
}

async function run() {
    const isRunning = await checkBackend();
    if (isRunning) {
        await testShowtimeAPI();
    }
}

run();

