import mongoose from 'mongoose';
import axios from 'axios';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';
import Showtime from '../models/Showtime.js';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to retry API calls
async function retryApiCall(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1}/${retries} after error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Fetch popular movies with full details
async function fetchMoviesFromTMDB() {
    const movies = [];
    const pages = 5; // Get 100 movies (20 per page)
    const maxMovies = 100; // Limit to 100 movies

    console.log('Fetching movies from TMDB...');

    for (let page = 1; page <= pages; page++) {
        try {
            const response = await retryApiCall(() =>
                axios.get(`${TMDB_BASE_URL}/movie/popular`, {
                    params: { api_key: TMDB_API_KEY, page, language: 'en-US' },
                    timeout: 10000
                })
            );

            console.log(`Fetching page ${page}/${pages}...`);

            for (const movie of response.data.results) {
                // Stop if we've reached the maximum number of movies
                if (movies.length >= maxMovies) {
                    console.log(`Reached maximum of ${maxMovies} movies for testing.`);
                    break;
                }

                try {
                    // Fetch detailed info including cast, crew, and videos
                    const details = await retryApiCall(() =>
                        axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
                            params: {
                                api_key: TMDB_API_KEY,
                                append_to_response: 'credits,videos',
                                language: 'en-US'
                            },
                            timeout: 10000
                        })
                    );

                    // Find YouTube trailer
                    const trailer = details.data.videos?.results?.find(
                        v => v.type === 'Trailer' && v.site === 'YouTube'
                    );

                    // Get director
                    const director = details.data.credits?.crew?.find(
                        c => c.job === 'Director'
                    );

                    // Get cast (top 10)
                    const cast = details.data.credits?.cast?.slice(0, 10).map(c => ({
                        name: c.name,
                        character: c.character,
                        profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                    })) || [];

                    movies.push({
                        title: details.data.title,
                        description: details.data.overview || 'No description available.',
                        posterUrl: details.data.poster_path
                            ? `https://image.tmdb.org/t/p/w500${details.data.poster_path}`
                            : 'https://via.placeholder.com/500x750?text=No+Poster',
                        backdropUrl: details.data.backdrop_path
                            ? `https://image.tmdb.org/t/p/original${details.data.backdrop_path}`
                            : null,
                        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
                        duration: details.data.runtime || 120,
                        releaseDate: details.data.release_date ? new Date(details.data.release_date) : new Date(),
                        genres: details.data.genres?.map(g => g.name) || ['Drama'],
                        rating: details.data.vote_average ? parseFloat(details.data.vote_average.toFixed(1)) : 7.0,
                        cast: cast,
                        director: director?.name || 'Unknown',
                        originalLanguage: details.data.original_language?.toUpperCase() || 'EN',
                        status: 'now-showing'
                    });

                    console.log(`✓ Fetched: ${details.data.title}`);

                    // Rate limiting to avoid TMDB API throttling
                    await new Promise(resolve => setTimeout(resolve, 250));
                } catch (err) {
                    console.error(`Error fetching movie ${movie.id}:`, err.message);
                }
            }

            // Break outer loop if we've reached max movies
            if (movies.length >= maxMovies) {
                break;
            }
        } catch (err) {
            console.error(`Error fetching page ${page}:`, err.message);
        }
    }

    return movies;
}

// Create screens with seat layouts
function generateSeatLayout(rows, seatsPerRow) {
    const seatLayout = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < rows; i++) {
        const rowLetter = rowLetters[i];
        for (let j = 1; j <= seatsPerRow; j++) {
            seatLayout.push({
                row: rowLetter,
                number: j,
                seatId: `${rowLetter}${j}`,
                type: i < 2 ? 'premium' : (i >= rows - 2 ? 'vip' : 'regular'),
                isAvailable: true
            });
        }
    }

    return seatLayout;
}

// Seed screens
async function seedScreens() {
    const screens = [
        {
            name: 'Screen 1',
            screenType: 'Standard',
            totalSeats: 150,
            rows: [
                { row: 'A', seatsPerRow: 15 },
                { row: 'B', seatsPerRow: 15 },
                { row: 'C', seatsPerRow: 15 },
                { row: 'D', seatsPerRow: 15 },
                { row: 'E', seatsPerRow: 15 },
                { row: 'F', seatsPerRow: 15 },
                { row: 'G', seatsPerRow: 15 },
                { row: 'H', seatsPerRow: 15 },
                { row: 'I', seatsPerRow: 15 },
                { row: 'J', seatsPerRow: 15 }
            ],
            seatLayout: generateSeatLayout(10, 15),
            priceMultiplier: 1.0
        },
        {
            name: 'Screen 2',
            screenType: 'IMAX',
            totalSeats: 200,
            rows: [
                { row: 'A', seatsPerRow: 20 },
                { row: 'B', seatsPerRow: 20 },
                { row: 'C', seatsPerRow: 20 },
                { row: 'D', seatsPerRow: 20 },
                { row: 'E', seatsPerRow: 20 },
                { row: 'F', seatsPerRow: 20 },
                { row: 'G', seatsPerRow: 20 },
                { row: 'H', seatsPerRow: 20 },
                { row: 'I', seatsPerRow: 20 },
                { row: 'J', seatsPerRow: 20 }
            ],
            seatLayout: generateSeatLayout(10, 20),
            priceMultiplier: 1.5
        },
        {
            name: 'Screen 3',
            screenType: '3D',
            totalSeats: 120,
            rows: [
                { row: 'A', seatsPerRow: 15 },
                { row: 'B', seatsPerRow: 15 },
                { row: 'C', seatsPerRow: 15 },
                { row: 'D', seatsPerRow: 15 },
                { row: 'E', seatsPerRow: 15 },
                { row: 'F', seatsPerRow: 15 },
                { row: 'G', seatsPerRow: 15 },
                { row: 'H', seatsPerRow: 15 }
            ],
            seatLayout: generateSeatLayout(8, 15),
            priceMultiplier: 1.3
        },
        {
            name: 'Screen 4',
            screenType: 'Standard',
            totalSeats: 96,
            rows: [
                { row: 'A', seatsPerRow: 12 },
                { row: 'B', seatsPerRow: 12 },
                { row: 'C', seatsPerRow: 12 },
                { row: 'D', seatsPerRow: 12 },
                { row: 'E', seatsPerRow: 12 },
                { row: 'F', seatsPerRow: 12 },
                { row: 'G', seatsPerRow: 12 },
                { row: 'H', seatsPerRow: 12 }
            ],
            seatLayout: generateSeatLayout(8, 12),
            priceMultiplier: 1.0
        },
        {
            name: 'Screen 5',
            screenType: 'Dolby',
            totalSeats: 180,
            rows: [
                { row: 'A', seatsPerRow: 18 },
                { row: 'B', seatsPerRow: 18 },
                { row: 'C', seatsPerRow: 18 },
                { row: 'D', seatsPerRow: 18 },
                { row: 'E', seatsPerRow: 18 },
                { row: 'F', seatsPerRow: 18 },
                { row: 'G', seatsPerRow: 18 },
                { row: 'H', seatsPerRow: 18 },
                { row: 'I', seatsPerRow: 18 },
                { row: 'J', seatsPerRow: 18 }
            ],
            seatLayout: generateSeatLayout(10, 18),
            priceMultiplier: 1.4
        }
    ];

    await Screen.deleteMany({});
    const createdScreens = await Screen.insertMany(screens);
    console.log(`✓ Created ${createdScreens.length} screens`);
    return createdScreens;
}

// Generate realistic showtimes for next 2 months with random scheduling
async function seedShowtimes(movies, screens) {
    const showtimes = [];
    const allTimes = ['10:00', '13:00', '16:00', '19:00', '22:00'];
    const basePrice = 12.0;

    // Start from today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Generating realistic showtimes for 2 months...');
    console.log(`Starting from: ${today.toISOString().split('T')[0]}`);
    
    // Display available screen types
    const screenTypes = {};
    screens.forEach(screen => {
        const type = screen.screenType || 'Standard';
        if (!screenTypes[type]) {
            screenTypes[type] = [];
        }
        screenTypes[type].push(screen.name);
    });
    
    console.log('\n📺 Available Screen Types:');
    Object.entries(screenTypes).forEach(([type, screenNames]) => {
        console.log(`  ${type}: ${screenNames.join(', ')} (${screenNames.length} screens)`);
    });
    console.log('');

    // Helper function to check if date is weekend
    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    };

    // Helper function to get random subset of array
    const getRandomSubset = (arr, min, max) => {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // Assign each movie a showing pattern
    const movieSchedules = movies.map(movie => {
        const scheduleType = Math.random();

        // Separate screens by type for better distribution
        const standardScreens = screens.filter(s => s.screenType === 'Standard');
        const premiumScreens = screens.filter(s => ['IMAX', 'Dolby', '3D'].includes(s.screenType));
        const allScreens = screens;

        if (scheduleType < 0.3) {
            // 30% - Weekend only movies (limited release) - mostly standard screens
            const selectedScreens = standardScreens.length > 0
                ? getRandomSubset(standardScreens, 1, Math.min(2, standardScreens.length))
                : getRandomSubset(allScreens, 1, 2);
            return { movie, type: 'weekend-only', screens: selectedScreens };
        } else if (scheduleType < 0.6) {
            // 30% - Random days (indie/art house) - mix of standard and 1 premium
            const selectedScreens = getRandomSubset(allScreens, 1, 2);
            return { movie, type: 'random', screens: selectedScreens, daysPerWeek: Math.floor(Math.random() * 2) + 2 };
        } else {
            // 40% - Regular showing (blockbusters) - prefer premium screens
            const selectedScreens = premiumScreens.length > 0
                ? getRandomSubset([...premiumScreens, ...getRandomSubset(standardScreens, 0, 1)], 2, 3)
                : getRandomSubset(allScreens, 2, 3);
            return { movie, type: 'regular', screens: selectedScreens, daysPerWeek: Math.floor(Math.random() * 3) + 4 };
        }
    });

    // Generate showtimes for 60 days
    for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
        const date = new Date(today.getTime());
        date.setDate(date.getDate() + dayOffset);
        const isWeekendDay = isWeekend(date);

        movieSchedules.forEach(schedule => {
            let showToday = false;

            if (schedule.type === 'weekend-only') {
                // Only show on weekends
                showToday = isWeekendDay;
            } else if (schedule.type === 'random') {
                // Random days - use daysPerWeek to determine probability
                const probability = schedule.daysPerWeek / 7;
                showToday = Math.random() < probability;
            } else {
                // Regular showing - high probability, extra high on weekends
                const probability = isWeekendDay ? 0.9 : (schedule.daysPerWeek / 7);
                showToday = Math.random() < probability;
            }

            if (showToday) {
                // This movie shows today on its assigned screens
                schedule.screens.forEach(screen => {
                    // Realistic number of showtimes per day:
                    // Weekend-only or limited: 1-2 times
                    // Random schedule: 1-2 times
                    // Regular: 2-3 times
                    let minTimes, maxTimes;
                    if (schedule.type === 'weekend-only') {
                        minTimes = 1; maxTimes = 2;
                    } else if (schedule.type === 'random') {
                        minTimes = 1; maxTimes = 2;
                    } else {
                        minTimes = isWeekendDay ? 2 : 1;
                        maxTimes = isWeekendDay ? 3 : 2;
                    }

                    const timeSlotsToday = getRandomSubset(allTimes, minTimes, maxTimes);

                    timeSlotsToday.forEach(time => {
                        showtimes.push({
                            movieId: schedule.movie._id,
                            screenId: screen._id,
                            date: new Date(date),
                            time: time,
                            price: basePrice * screen.priceMultiplier,
                            availableSeats: screen.totalSeats
                        });
                    });
                });
            }
        });
    }

    await Showtime.deleteMany({});
    const createdShowtimes = await Showtime.insertMany(showtimes);

    console.log(`✓ Created ${createdShowtimes.length} showtimes`);
    console.log(`✓ Covering 60 days (2 months)`);
    console.log(`✓ ${movieSchedules.filter(s => s.type === 'weekend-only').length} weekend-only movies`);
    console.log(`✓ ${movieSchedules.filter(s => s.type === 'random').length} random-schedule movies`);
    console.log(`✓ ${movieSchedules.filter(s => s.type === 'regular').length} regular-schedule movies`);

    return createdShowtimes;
}

// Main seed function
async function seedDatabase() {
    try {
        console.log('=================================');
        console.log('Starting Database Seeding Process');
        console.log('=================================\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking');
        console.log('✓ Connected to MongoDB\n');

        console.log('Step 1: Fetching movies from TMDB API...');
        const movieData = await fetchMoviesFromTMDB();
        console.log(`✓ Fetched ${movieData.length} movies from TMDB\n`);

        // Clear existing data
        console.log('Step 2: Clearing existing data...');
        await Movie.deleteMany({});
        await Screen.deleteMany({});
        await Showtime.deleteMany({});
        console.log('✓ Cleared existing data\n');

        if (movieData.length === 0) {
            console.log('⚠ No movies fetched from TMDB. Cannot proceed with seeding.');
            console.log('Please check:');
            console.log('  1. Your internet connection');
            console.log('  2. TMDB API key is valid');
            console.log('  3. TMDB API is accessible');
            process.exit(1);
        }

        console.log('Step 3: Inserting movies into database...');
        const movies = await Movie.insertMany(movieData);
        console.log(`✓ Seeded ${movies.length} movies\n`);

        // Seed screens
        console.log('Step 4: Creating cinema screens...');
        const screens = await seedScreens();
        console.log('');

        // Seed showtimes
        console.log('Step 5: Generating showtimes...');
        const showtimes = await seedShowtimes(movies, screens);
        console.log('');

        console.log('=================================');
        console.log('Database Seeding Completed!');
        console.log('=================================');
        console.log(`Total Movies: ${movies.length}`);
        console.log(`Total Screens: ${screens.length}`);
        console.log(`Total Showtimes: ${showtimes.length}`);
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();

