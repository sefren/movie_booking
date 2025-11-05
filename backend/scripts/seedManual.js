import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';
import Showtime from '../models/Showtime.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample movies data (manually created, no TMDB API needed)
const sampleMovies = [
    {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
        trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        genres: ['Action', 'Crime', 'Drama', 'Thriller'],
        rating: 9.0,
        cast: [
            { name: 'Christian Bale', character: 'Bruce Wayne / Batman', profileUrl: 'https://image.tmdb.org/t/p/w185/3qx2QFUbG6t6IlzR0F9k3Z6Yhf7.jpg' },
            { name: 'Heath Ledger', character: 'Joker', profileUrl: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg' },
            { name: 'Aaron Eckhart', character: 'Harvey Dent / Two-Face', profileUrl: 'https://image.tmdb.org/t/p/w185/2BKhjEJmm3v62VIh3yVpSDrDQWk.jpg' }
        ],
        director: 'Christopher Nolan',
        originalLanguage: 'EN',
        status: 'now-showing'
    },
    {
        title: 'Inception',
        description: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
        duration: 148,
        releaseDate: new Date('2010-07-16'),
        genres: ['Action', 'Science Fiction', 'Adventure'],
        rating: 8.8,
        cast: [
            { name: 'Leonardo DiCaprio', character: 'Cobb', profileUrl: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
            { name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://image.tmdb.org/t/p/w185/z2FA8js799xqtfiFjBTicFYdfk.jpg' },
            { name: 'Elliot Page', character: 'Ariadne', profileUrl: 'https://image.tmdb.org/t/p/w185/eCeFgzS8dYHnMfWQT0oQitCrsSz.jpg' }
        ],
        director: 'Christopher Nolan',
        originalLanguage: 'EN',
        status: 'now-showing'
    },
    {
        title: 'Interstellar',
        description: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
        trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        genres: ['Adventure', 'Drama', 'Science Fiction'],
        rating: 8.6,
        cast: [
            { name: 'Matthew McConaughey', character: 'Cooper', profileUrl: 'https://image.tmdb.org/t/p/w185/sY2mwpafcwqyYS1sOySu1MENDse.jpg' },
            { name: 'Anne Hathaway', character: 'Brand', profileUrl: 'https://image.tmdb.org/t/p/w185/tLelKoPXdjVFXH4H8MhhNvTwXmE.jpg' },
            { name: 'Jessica Chastain', character: 'Murph', profileUrl: 'https://image.tmdb.org/t/p/w185/vOFrDeYXILnj747dOleaNh4jK3l.jpg' }
        ],
        director: 'Christopher Nolan',
        originalLanguage: 'EN',
        status: 'now-showing'
    },
    {
        title: 'The Matrix',
        description: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw93.jpg',
        trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
        duration: 136,
        releaseDate: new Date('1999-03-31'),
        genres: ['Action', 'Science Fiction'],
        rating: 8.7,
        cast: [
            { name: 'Keanu Reeves', character: 'Neo', profileUrl: 'https://image.tmdb.org/t/p/w185/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg' },
            { name: 'Laurence Fishburne', character: 'Morpheus', profileUrl: 'https://image.tmdb.org/t/p/w185/8suOhUmPbfKqDQ17jQ1Gy0mI3P4.jpg' },
            { name: 'Carrie-Anne Moss', character: 'Trinity', profileUrl: 'https://image.tmdb.org/t/p/w185/xB8vHpO7vAggtNejdATmceXdOHf.jpg' }
        ],
        director: 'Lana Wachowski',
        originalLanguage: 'EN',
        status: 'now-showing'
    },
    {
        title: 'Pulp Fiction',
        description: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        trailerUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY',
        duration: 154,
        releaseDate: new Date('1994-10-14'),
        genres: ['Thriller', 'Crime'],
        rating: 8.9,
        cast: [
            { name: 'John Travolta', character: 'Vincent Vega', profileUrl: 'https://image.tmdb.org/t/p/w185/fShJqHl1tyLCDh1RlqcGHGpTFy7.jpg' },
            { name: 'Samuel L. Jackson', character: 'Jules Winnfield', profileUrl: 'https://image.tmdb.org/t/p/w185/AiAYAqwpM5xmiFrAIeQvUXDCVvo.jpg' },
            { name: 'Uma Thurman', character: 'Mia Wallace', profileUrl: 'https://image.tmdb.org/t/p/w185/xuxgPXyv6KjUHIM8cZaxx4ry25L.jpg' }
        ],
        director: 'Quentin Tarantino',
        originalLanguage: 'EN',
        status: 'now-showing'
    }
];

// Generate seat layout
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

    const createdScreens = await Screen.insertMany(screens);
    console.log(`✓ Created ${createdScreens.length} screens`);
    return createdScreens;
}

// Generate showtimes
async function seedShowtimes(movies, screens) {
    const showtimes = [];
    const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];
    const basePrice = 12.0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Generating showtimes...');
    console.log(`Starting from: ${today.toISOString().split('T')[0]}`);

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const date = new Date(today.getTime());
        date.setDate(today.getDate() + dayOffset);

        // Rotate which movies are showing each day
        const dailyMovies = [];
        for (let i = 0; i < screens.length; i++) {
            const movieIndex = (dayOffset * screens.length + i) % movies.length;
            dailyMovies.push(movies[movieIndex]);
        }

        // Create showtimes for each screen
        screens.forEach((screen, screenIdx) => {
            const movie = dailyMovies[screenIdx];

            times.forEach(time => {
                showtimes.push({
                    movieId: movie._id,
                    screenId: screen._id,
                    date: new Date(date),
                    time: time,
                    price: basePrice * screen.priceMultiplier,
                    availableSeats: screen.totalSeats
                });
            });
        });
    }

    const createdShowtimes = await Showtime.insertMany(showtimes);
    console.log(`✓ Created ${createdShowtimes.length} showtimes`);
    return createdShowtimes;
}

// Main seed function
async function seedManualData() {
    try {
        console.log('=================================');
        console.log('   Manual Database Seeding      ');
        console.log('   (No TMDB API Required)       ');
        console.log('=================================\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Clear existing data
        console.log('Step 1: Clearing existing data...');
        await Movie.deleteMany({});
        await Screen.deleteMany({});
        await Showtime.deleteMany({});

        // Drop indexes to avoid conflicts
        try {
            await Movie.collection.dropIndexes();
            console.log('✓ Dropped old indexes');
        } catch (err) {
            console.log('✓ No indexes to drop');
        }

        console.log('✓ Cleared existing data\n');

        // Seed movies
        console.log('Step 2: Seeding sample movies...');
        const movies = await Movie.insertMany(sampleMovies);
        console.log(`✓ Seeded ${movies.length} movies\n`);

        // Seed screens
        console.log('Step 3: Creating cinema screens...');
        const screens = await seedScreens();
        console.log('');

        // Seed showtimes
        console.log('Step 4: Generating showtimes...');
        const showtimes = await seedShowtimes(movies, screens);
        console.log('');

        console.log('=================================');
        console.log('Database Seeding Completed!');
        console.log('=================================');
        console.log(`Total Movies: ${movies.length}`);
        console.log(`Total Screens: ${screens.length}`);
        console.log(`Total Showtimes: ${showtimes.length}`);
        console.log('=================================\n');

        console.log('✓ You can now start the backend server!');
        console.log('  Run: npm run dev\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedManualData();

