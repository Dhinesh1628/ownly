import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback if environment restricts changing dns servers
}

import mongoose from 'mongoose';

const testDatabaseConnection = async () => {
  try {
    console.log('[Test-DB] Attempting connection to MongoDB Atlas with custom DNS...');
    console.log(`[Test-DB] URI target: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Test-DB] SUCCESS: Connected to MongoDB cluster host: ${conn.connection.host}`);
    console.log(`[Test-DB] Database name: ${conn.connection.name}`);
    await mongoose.connection.close();
    console.log('[Test-DB] Connection cleanly closed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Test-DB] FAILED: ${error.message}`);
    process.exit(1);
  }
};

testDatabaseConnection();
