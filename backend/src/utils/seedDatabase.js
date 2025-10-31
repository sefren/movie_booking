import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';
import Booking from '../models/Booking.js';

dotenv.config();

const screens = [
  {
    name: 'Screen 1',
    capacity: 96,
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: 'Standard',
    status: 'active',
  },
  {
    name: 'Screen 2',
    capacity: 96,
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: 'IMAX',
    status: 'active',
  },
  {
    name: 'Screen 3',
    capacity: 72,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: '3D',
    status: 'active',
  },
];

const getNextDays = (count) => {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Movie.deleteMany({});
    await Screen.deleteMany({});
    await Booking.deleteMany({});

    console.log('📽️  Creating screens...');
    const createdScreens = await Screen.insertMany(screens);

    console.log('🎬 Creating movies with showtimes...');
    const dates = getNextDays(7);
    const times = ['10:00 AM', '01:30 PM', '04:00 PM', '07:00 PM', '10:30 PM'];

    const movies = [
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropPath: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
        genres: ['Action', 'Crime', 'Drama'],
        rating: 9.0,
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        language: 'English',
        status: 'now_playing',
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdropPath: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        rating: 8.8,
        duration: 148,
        releaseDate: new Date('2010-07-16'),
        language: 'English',
        status: 'now_playing',
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropPath: '/pbrkL804c8yAv3zBZR4QPWZAAb5.jpg',
        genres: ['Drama', 'Sci-Fi'],
        rating: 8.6,
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        language: 'English',
        status: 'now_playing',
      },
    ];

    // Add showtimes to each movie
    const moviesWithShowtimes = movies.map((movie) => {
      const showtimes = [];
      dates.forEach((date) => {
        times.forEach((time) => {
          const randomScreen = createdScreens[Math.floor(Math.random() * createdScreens.length)];
          showtimes.push({
            time,
            screenId: randomScreen._id,
            date,
            availableSeats: randomScreen.capacity,
            price: 12.5,
          });
        });
      });
      return { ...movie, showtimes };
    });

    await Movie.insertMany(moviesWithShowtimes);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${createdScreens.length} screens`);
    console.log(`🎬 Created ${moviesWithShowtimes.length} movies`);
    console.log(`⏰ Each movie has ${times.length} showtimes per day for ${dates.length} days`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
