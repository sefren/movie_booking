import mongoose from 'mongoose';
import Showtime from '../models/Showtime.js';
import Screen from '../models/Screen.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking';
const USD_TO_INR = 80; // Conversion rate

async function updatePrices() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all screens to know their price multipliers
        const screens = await Screen.find({});
        console.log(`📺 Found ${screens.length} screens\n`);

        // Update showtimes prices
        console.log('💰 Updating showtime prices from USD to INR...');
        const showtimes = await Showtime.find({});
        console.log(`📋 Found ${showtimes.length} showtimes to update\n`);

        let updated = 0;
        for (const showtime of showtimes) {
            const screen = screens.find(s => s._id.toString() === showtime.screenId.toString());
            if (!screen) {
                console.log(`⚠️  Screen not found for showtime ${showtime._id}`);
                continue;
            }

            // Calculate new price: Base price ₹1000 * screen multiplier
            const basePrice = 1000;
            const newPrice = Math.round(basePrice * screen.priceMultiplier);

            // Update showtime
            await Showtime.updateOne(
                { _id: showtime._id },
                { $set: { price: newPrice } }
            );

            updated++;
            if (updated % 100 === 0) {
                console.log(`  Updated ${updated}/${showtimes.length} showtimes...`);
            }
        }

        console.log(`\n✅ Updated ${updated} showtimes with new rupee pricing`);

        // Show sample of updated prices
        console.log('\n📊 Sample prices by screen type:');
        const updatedShowtimes = await Showtime.find({}).populate('screenId').limit(10);

        const pricesByType = {};
        for (const showtime of updatedShowtimes) {
            const type = showtime.screenId?.screenType || 'Standard';
            if (!pricesByType[type]) {
                pricesByType[type] = showtime.price;
            }
        }

        Object.entries(pricesByType).forEach(([type, price]) => {
            console.log(`  ${type}: ₹${price}`);
        });

        console.log('\n✅ Price update complete!');
        console.log('\n💡 Pricing breakdown:');
        console.log('  Standard: ₹1000 (1.0x multiplier)');
        console.log('  Premium: ₹1300 (1.3x multiplier)');
        console.log('  IMAX: ₹1500 (1.5x multiplier)');
        console.log('  4DX: ₹1400 (1.4x multiplier)\n');

    } catch (error) {
        console.error('❌ Error updating prices:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run the update
updatePrices();

