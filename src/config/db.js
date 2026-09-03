const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';
  const localFallback = 'mongodb://127.0.0.1:27017/shopease_ecommerce';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Primary connection failed: ${error.message}`);

    // If in development and remote Atlas connection failed, attempt local fallback
    if (process.env.NODE_ENV !== 'production' && primaryUri !== localFallback) {
      console.warn(`[MongoDB] Falling back to local MongoDB: ${localFallback}...`);
      try {
        const localConn = await mongoose.connect(localFallback);
        console.log(`[MongoDB] Connected to local fallback: ${localConn.connection.host}/${localConn.connection.name}`);
        return localConn;
      } catch (localErr) {
        console.error(`[MongoDB] Local fallback also failed: ${localErr.message}`);
      }
    }

    console.error(`\n[MongoDB Connection Guidance]:
1. Verify database username and password in MongoDB Atlas (Database Access tab).
2. Ensure Network Access in MongoDB Atlas allows IP '0.0.0.0/0' (Allow Access from Anywhere).
3. Verify MONGODB_URI environment variable in Render Dashboard.\n`);
    throw error;
  }
};

module.exports = connectDB;
