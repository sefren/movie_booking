import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';
import Showtime from '../models/Showtime.js';

dotenv.config();

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

// Generate realistic showtimes for existing movies
async function updateShowtimes() {
    const allTimes = ['10:00', '13:00', '16:00', '19:00', '22:00'];
    const basePrice = 12.0;

    // Start from today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('🎬 Updating showtimes for existing movies...');
    console.log(`Starting from: ${today.toISOString().split('T')[0]}`);

    try {
        // Fetch existing movies and screens
        const movies = await Movie.find();
        const screens = await Screen.find();

        if (movies.length === 0) {
            console.log('❌ No movies found in database!');
            console.log('Run: npm run seed:manual  first to add movies');
            return;
        }

        console.log(`✓ Found ${movies.length} movies`);
        console.log(`✓ Found ${screens.length} screens`);

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

        const showtimes = [];

        // Generate showtimes for next 60 days (2 months)
        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
            const date = new Date(today.getTime());
            date.setDate(today.getDate() + dayOffset);
            const isWeekendDay = isWeekend(date);

            // Decide which movies show today
            movieSchedules.forEach(schedule => {
                let showToday = false;

                if (schedule.type === 'weekend-only') {
                    showToday = isWeekendDay;
                } else if (schedule.type === 'random') {
                    const probability = schedule.daysPerWeek / 7;
                    showToday = Math.random() < probability;
                } else {
                    const probability = isWeekendDay ? 0.9 : (schedule.daysPerWeek / 7);
                    showToday = Math.random() < probability;
                }

                if (showToday) {
                    schedule.screens.forEach(screen => {
                        // Realistic number of showtimes per day
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

        // Delete old showtimes and insert new ones
        console.log('\n🗑️  Deleting old showtimes...');
        await Showtime.deleteMany({});
        console.log('✓ Old showtimes deleted');

        console.log('\n📅 Inserting new showtimes...');
        const created = await Showtime.insertMany(showtimes);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Showtimes Updated Successfully!');
        console.log('='.repeat(60));
        console.log(`Total Showtimes: ${created.length}`);
        console.log(`Covering: 60 days (2 months)`);
        console.log(`Weekend-only: ${movieSchedules.filter(s => s.type === 'weekend-only').length} movies`);
        console.log(`Random schedule: ${movieSchedules.filter(s => s.type === 'random').length} movies`);
        console.log(`Regular: ${movieSchedules.filter(s => s.type === 'regular').length} movies`);

        // Show screen type distribution
        console.log('\n📊 Screen Type Usage:');
        const screenUsage = {};
        created.forEach(showtime => {
            const screen = screens.find(s => s._id.equals(showtime.screenId));
            const type = screen?.screenType || 'Unknown';
            screenUsage[type] = (screenUsage[type] || 0) + 1;
        });
        Object.entries(screenUsage).forEach(([type, count]) => {
            const percentage = ((count / created.length) * 100).toFixed(1);
            console.log(`  ${type}: ${count} showtimes (${percentage}%)`);
        });
        console.log('='.repeat(60));

        return created;

    } catch (error) {
        console.error('❌ Error updating showtimes:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('='.repeat(60));
        console.log('   SHOWTIME UPDATE UTILITY');
        console.log('   Updates showtimes without touching movies');
        console.log('='.repeat(60));
        console.log('');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        await updateShowtimes();

        console.log('\n✓ Done! Backend server will now have updated showtimes.');
        console.log('  Restart backend: npm run dev\n');

    } catch (error) {
        console.error('\n❌ Update failed:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();

