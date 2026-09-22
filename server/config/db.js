const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI is not configured; using in-memory data store.');
    return false;
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
  return true;
};

module.exports = { connectDB };
