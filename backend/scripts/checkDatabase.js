import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const checkDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        const movies = await mongoose.connection.db.collection('movies').find().toArray();
        const screens = await mongoose.connection.db.collection('screens').find().toArray();
        const showtimes = await mongoose.connection.db.collection('showtimes').find().toArray();

        console.log('📊 Database Statistics:');
        console.log(`   Movies: ${movies.length}`);
        console.log(`   Screens: ${screens.length}`);
        console.log(`   Showtimes: ${showtimes.length}`);
        console.log('\n📽️ Movies in database:');
        movies.forEach((movie, i) => {
            console.log(`   ${i + 1}. ${movie.title} (${movie.status})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkDatabase();
