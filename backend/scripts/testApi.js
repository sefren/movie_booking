// Test backend API endpoints
const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendAPI() {
    console.log('🧪 Testing Backend API...\n');

    // Test 1: Health check
    console.log('Test 1: Health Check');
    try {
        const healthResponse = await fetch('http://localhost:5000');
        const healthData = await healthResponse.json();
        console.log('✓ Backend is running:', healthData);
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return;
    }

    console.log('\n---\n');

    // Test 2: Fetch all movies
    console.log('Test 2: Fetch All Movies');
    try {
        const moviesResponse = await fetch(`${API_BASE_URL}/movies`);
        const moviesData = await moviesResponse.json();
        console.log('Response structure:', Object.keys(moviesData));
        console.log('Full response:', JSON.stringify(moviesData, null, 2));

        if (moviesData.success) {
            console.log(`✓ Found ${moviesData.data?.movies?.length || 0} movies`);
            if (moviesData.data?.movies?.length > 0) {
                console.log('First movie:', moviesData.data.movies[0].title);
            }
        } else {
            console.error('❌ API returned success: false');
        }
    } catch (error) {
        console.error('❌ Failed to fetch movies:', error.message);
    }

    console.log('\n---\n');

    // Test 3: Fetch with status filter
    console.log('Test 3: Fetch Movies with status=now-showing');
    try {
        const response = await fetch(`${API_BASE_URL}/movies?status=now-showing`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

testBackendAPI();

