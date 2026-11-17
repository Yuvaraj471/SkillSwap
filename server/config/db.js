const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

    if (mongoUri === 'memory') {
      try {
        console.log('⚡ Attempting fast local MongoDB connection first...');
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/skillswap', { serverSelectionTimeoutMS: 2000 });
        console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.log('⚡ Falling back to in-memory MongoDB Server...');
        mongoMemoryServer = await MongoMemoryServer.create();
        mongoUri = mongoMemoryServer.getUri();
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
