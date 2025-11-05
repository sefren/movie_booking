import mongoose from 'mongoose';
import axios from 'axios';
import Movie from '../models/Movie.js';
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

// Fetch upcoming movies from TMDB
async function fetchUpcomingMoviesFromTMDB() {
    const movies = [];
    const pages = 3; // Get 60 movies (20 per page)
    const maxMovies = 50; // Limit to 50 coming soon movies

    console.log('🎬 Fetching upcoming movies from TMDB...');

    for (let page = 1; page <= pages; page++) {
        try {
            const response = await retryApiCall(() =>
                axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
                    params: { api_key: TMDB_API_KEY, page, language: 'en-US' },
                    timeout: 10000
                })
            );

            console.log(`📄 Fetching page ${page}/${pages}...`);

            for (const movie of response.data.results) {
                // Stop if we've reached the maximum number of movies
                if (movies.length >= maxMovies) {
                    console.log(`✓ Reached maximum of ${maxMovies} upcoming movies.`);
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

                    // Skip if already released
                    const releaseDate = new Date(details.data.release_date);
                    const today = new Date();
                    if (releaseDate < today) {
                        console.log(`⏭️  Skipping ${details.data.title} (already released)`);
                        continue;
                    }

                    // Find YouTube trailer
                    const trailer = details.data.videos?.results?.find(
                        v => v.type === 'Trailer' && v.site === 'YouTube'
                    );

                    // Get director
                    const director = details.data.credits?.crew?.find(
                        c => c.job === 'Director'
                    );

                    // Get crew (director, writer, producer)
                    const crew = [];
                    if (director) {
                        crew.push({
                            name: director.name,
                            job: 'Director',
                            profileUrl: director.profile_path
                                ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                                : null
                        });
                    }

                    const writer = details.data.credits?.crew?.find(
                        c => c.job === 'Writer' || c.job === 'Screenplay'
                    );
                    if (writer) {
                        crew.push({
                            name: writer.name,
                            job: writer.job,
                            profileUrl: writer.profile_path
                                ? `https://image.tmdb.org/t/p/w185${writer.profile_path}`
                                : null
                        });
                    }

                    // Get cast (top 10)
                    const cast = details.data.credits?.cast?.slice(0, 10).map(c => ({
                        name: c.name,
                        character: c.character,
                        profileUrl: c.profile_path
                            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                            : null
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
                        releaseDate: releaseDate,
                        genres: details.data.genres?.map(g => g.name) || ['Drama'],
                        rating: details.data.vote_average ? parseFloat(details.data.vote_average.toFixed(1)) : null,
                        cast: cast,
                        crew: crew,
                        director: director?.name || 'Unknown',
                        originalLanguage: details.data.original_language?.toUpperCase() || 'EN',
                        status: 'coming-soon', // Important: Set as coming-soon
                        popularity: details.data.popularity || 0
                    });

                    console.log(`✓ Fetched: ${details.data.title} (Release: ${releaseDate.toISOString().split('T')[0]})`);

                    // Rate limiting to avoid TMDB API throttling
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (err) {
                    console.error(`❌ Error fetching movie ${movie.id}:`, err.message);
                }
            }

            // Break outer loop if we've reached max movies
            if (movies.length >= maxMovies) {
                break;
            }
        } catch (err) {
            console.error(`❌ Error fetching page ${page}:`, err.message);
        }
    }

    // Sort by release date (earliest first)
    movies.sort((a, b) => a.releaseDate - b.releaseDate);

    return movies;
}

// Seed only coming soon movies
async function seedComingSoonMovies() {
    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema');
        console.log('✓ Connected to MongoDB\n');

        // Fetch upcoming movies from TMDB
        const upcomingMovies = await fetchUpcomingMoviesFromTMDB();

        if (upcomingMovies.length === 0) {
            console.log('⚠️  No upcoming movies fetched. Exiting...');
            process.exit(1);
        }

        console.log(`\n📊 Fetched ${upcomingMovies.length} upcoming movies`);

        // Remove existing coming-soon movies
        console.log('\n🗑️  Removing existing coming-soon movies...');
        const deleteResult = await Movie.deleteMany({ status: 'coming-soon' });
        console.log(`✓ Removed ${deleteResult.deletedCount} existing coming-soon movies`);

        // Insert new coming-soon movies
        console.log('\n💾 Inserting new coming-soon movies...');
        const insertedMovies = await Movie.insertMany(upcomingMovies);
        console.log(`✓ Inserted ${insertedMovies.length} coming-soon movies`);

        // Display summary
        console.log('\n📋 Summary:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✓ Total Coming Soon Movies: ${insertedMovies.length}`);

        // Show earliest and latest release dates
        const earliestRelease = insertedMovies[0].releaseDate;
        const latestRelease = insertedMovies[insertedMovies.length - 1].releaseDate;
        console.log(`📅 Release Date Range: ${earliestRelease.toISOString().split('T')[0]} to ${latestRelease.toISOString().split('T')[0]}`);

        // Show some examples
        console.log('\n🎬 Sample Movies:');
        insertedMovies.slice(0, 5).forEach((movie, idx) => {
            console.log(`   ${idx + 1}. ${movie.title} - ${movie.releaseDate.toISOString().split('T')[0]}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Coming Soon movies seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error seeding coming soon movies:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seed function
seedComingSoonMovies();

