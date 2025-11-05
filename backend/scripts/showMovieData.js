import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const showMovieData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const movies = await mongoose.connection.db.collection('movies').find().limit(1).toArray();

    if (movies.length > 0) {
      console.log('📽️ Complete Movie Data Structure:\n');
      console.log('='.repeat(80));
      console.log(JSON.stringify(movies[0], null, 2));
      console.log('='.repeat(80));
      console.log('\n📊 Fields Summary:');
      console.log('---');
      Object.keys(movies[0]).forEach(key => {
        const value = movies[0][key];
        const type = Array.isArray(value) ? `Array(${value.length})` : typeof value;
        console.log(`  ${key}: ${type}`);
      });

      // Show genres
      console.log('\n🎭 Genres:', movies[0].genres);

      // Show cast
      console.log('\n🎬 Cast:');
      movies[0].cast?.forEach((actor, i) => {
        console.log(`  ${i + 1}. ${actor.name} as ${actor.character}`);
      });

      console.log('\n🎥 Director:', movies[0].director);
      console.log('⏱️  Duration:', movies[0].duration, 'minutes');
      console.log('⭐ Rating:', movies[0].rating);
      console.log('📅 Release Date:', movies[0].releaseDate);
      console.log('🌍 Language:', movies[0].originalLanguage);
      console.log('📊 Status:', movies[0].status);

    } else {
      console.log('❌ No movies found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

showMovieData();

