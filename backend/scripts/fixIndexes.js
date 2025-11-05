import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndexes() {
    try {
        console.log('🔧 Fixing MongoDB indexes...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const bookingsCollection = db.collection('bookings');

        // Get current indexes
        console.log('📋 Current indexes:');
        const indexes = await bookingsCollection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}`);
        });

        // Drop problematic indexes
        console.log('\n🗑️  Dropping problematic indexes...');

        try {
            await bookingsCollection.dropIndex('bookingId_1');
            console.log('✓ Dropped bookingId_1 index');
        } catch (error) {
            console.log('⚠️  bookingId_1 index not found or already dropped');
        }

        try {
            await bookingsCollection.dropIndex('movieId_1_showtime.date_1');
            console.log('✓ Dropped movieId_1_showtime.date_1 index (old schema)');
        } catch (error) {
            console.log('⚠️  movieId_1_showtime.date_1 index not found');
        }

        try {
            await bookingsCollection.dropIndex('lockedUntil_1');
            console.log('✓ Dropped lockedUntil_1 index (field renamed to expiresAt)');
        } catch (error) {
            console.log('⚠️  lockedUntil_1 index not found');
        }

        try {
            await bookingsCollection.dropIndex('status_1_createdAt_-1');
            console.log('✓ Dropped status_1_createdAt_-1 index (not in current schema)');
        } catch (error) {
            console.log('⚠️  status_1_createdAt_-1 index not found');
        }

        // Show final indexes
        console.log('\n📋 Final indexes:');
        const finalIndexes = await bookingsCollection.indexes();
        finalIndexes.forEach(index => {
            console.log(`  - ${index.name}`);
        });

        console.log('\n✅ Indexes fixed successfully!');
        console.log('You can now create bookings without errors.\n');

    } catch (error) {
        console.error('\n❌ Error fixing indexes:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixIndexes();

