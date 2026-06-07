import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/communite?authSource=admin';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  try {
    if (cached.conn) {
      console.log('✅ Using existing MongoDB connection');
      return cached.conn;
    }
    
    if (!cached.promise) {
      console.log('🟡 Connecting to MongoDB at:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
      cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      }).catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
      });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}