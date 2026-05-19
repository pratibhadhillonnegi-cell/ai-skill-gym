const mongoose = require('mongoose');

// Harden Mongoose against NoSQL injection and schema leakage
mongoose.set('strictQuery', true);
mongoose.set('strict', true);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-skill-gym';
  const source = process.env.MONGODB_URI ? 'MONGODB_URI' : 'local default';

  try {
    console.log(`⏳ Connecting to MongoDB using ${source}`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✓ MongoDB connected (${source})`);
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
