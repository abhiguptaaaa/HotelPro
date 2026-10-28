const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`💡 Tip: If you don't have MongoDB installed locally, use a free MongoDB Atlas URI in backend/.env`);
    // Do not terminate process in development so APIs can return friendly connection info
  }
};

module.exports = connectDB;
