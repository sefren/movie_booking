import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/database.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import Booking from "../models/Booking.js";

dotenv.config();

const screens = [
  {
    name: "Screen 1",
    capacity: 96,
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: "Standard",
    status: "active",
  },
  {
    name: "Screen 2",
    capacity: 96,
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: "IMAX",
    status: "active",
  },
  {
    name: "Screen 3",
    capacity: 72,
    rows: ["A", "B", "C", "D", "E", "F"],
    seatsPerRow: 12,
    aisleAfterSeat: 6,
    screenType: "3D",
    status: "active",
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

    console.log("  Clearing existing data...");
    await Movie.deleteMany({});
    await Screen.deleteMany({});
    await Booking.deleteMany({});

    console.log("  Creating screens...");
    const createdScreens = await Screen.insertMany(screens);

    console.log(" Creating movies with showtimes...");
    const dates = getNextDays(7);
    const times = ["10:00 AM", "01:30 PM", "04:00 PM", "07:00 PM", "10:30 PM"];

    // NOW PLAYING MOVIES - Currently in theaters
    const nowPlayingMovies = [
      {
        title: "The Dark Knight",
        description:
          "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdropPath: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
        genres: ["Action", "Crime", "Drama"],
        rating: 9.0,
        duration: 152,
        releaseDate: new Date("2008-07-18"),
        language: "English",
        status: "now_playing",
      },
      {
        title: "Inception",
        description:
          "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
        posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdropPath: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        genres: ["Action", "Sci-Fi", "Thriller"],
        rating: 8.8,
        duration: 148,
        releaseDate: new Date("2010-07-16"),
        language: "English",
        status: "now_playing",
      },
      {
        title: "Interstellar",
        description:
          "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdropPath: "/pbrkL804c8yAv3zBZR4QPWZAAb5.jpg",
        genres: ["Drama", "Sci-Fi"],
        rating: 8.6,
        duration: 169,
        releaseDate: new Date("2014-11-07"),
        language: "English",
        status: "now_playing",
      },
      {
        title: "The Matrix",
        description:
          "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        backdropPath: "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
        genres: ["Action", "Sci-Fi"],
        rating: 8.7,
        duration: 136,
        releaseDate: new Date("1999-03-30"),
        language: "English",
        status: "now_playing",
      },
      {
        title: "Parasite",
        description:
          "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        backdropPath: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
        genres: ["Drama", "Thriller"],
        rating: 8.5,
        duration: 132,
        releaseDate: new Date("2019-05-30"),
        language: "English",
        status: "now_playing",
      },
    ];

    // UPCOMING MOVIES - Coming soon (30-90 days from now)
    const today = new Date();
    const upcomingMovies = [
      {
        title: "Dune: Part Three",
        description:
          "The epic saga continues as Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.",
        posterPath: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        rating: 8.9,
        duration: 165,
        releaseDate: new Date(today.getFullYear(), today.getMonth() + 2, 15),
        language: "English",
        status: "upcoming",
      },
      {
        title: "Avatar 3: The Seed Bearer",
        description:
          "Jake Sully and Neytiri's family continue their fight to keep the people of Pandora safe and preserve their way of life.",
        posterPath: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        backdropPath: "/evaFLqtswezLosllRZyJiVoglZB.jpg",
        genres: ["Action", "Adventure", "Sci-Fi"],
        rating: 8.4,
        duration: 180,
        releaseDate: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        language: "English",
        status: "upcoming",
      },
      {
        title: "Mission: Impossible 8",
        description:
          "Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon before it falls into the wrong hands.",
        posterPath: "/Ar2h8TKFV9pwwu3wLO5xD7wEgSO.jpg",
        backdropPath: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
        genres: ["Action", "Thriller", "Adventure"],
        rating: 8.2,
        duration: 155,
        releaseDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
        language: "English",
        status: "upcoming",
      },
      {
        title: "Spider-Man: Beyond",
        description:
          "Spider-Man faces his greatest challenge yet as the multiverse threatens to collapse, forcing him to team up with allies from different dimensions.",
        posterPath: "/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg",
        backdropPath: "/VlHt27nCqOuTnuX6bku8QZapzO.jpg",
        genres: ["Action", "Adventure", "Animation"],
        rating: 8.6,
        duration: 140,
        releaseDate: new Date(today.getFullYear(), today.getMonth() + 2, 28),
        language: "English",
        status: "upcoming",
      },
    ];

    // Add showtimes to NOW PLAYING movies only
    const nowPlayingWithShowtimes = nowPlayingMovies.map((movie) => {
      const showtimes = [];
      dates.forEach((date) => {
        times.forEach((time) => {
          const randomScreen =
            createdScreens[Math.floor(Math.random() * createdScreens.length)];
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

    // Upcoming movies don't have showtimes yet (empty array)
    const upcomingWithoutShowtimes = upcomingMovies.map((movie) => ({
      ...movie,
      showtimes: [],
    }));

    // Insert all movies
    const allMovies = [...nowPlayingWithShowtimes, ...upcomingWithoutShowtimes];
    await Movie.insertMany(allMovies);

    console.log(" Database seeded successfully!");
    console.log(` Created ${createdScreens.length} screens`);
    console.log(` Created ${nowPlayingMovies.length} now playing movies`);
    console.log(`  Created ${upcomingMovies.length} upcoming movies`);
    console.log(
      ` Now playing movies have ${times.length} showtimes per day for ${dates.length} days`,
    );

    process.exit(0);
  } catch (error) {
    console.error(" Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
