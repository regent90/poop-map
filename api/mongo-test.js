export default async function handler(req, res) {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 動態導入 MongoDB
    const { MongoClient } = await import('mongodb');
    
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'poopmap';
    
    if (!mongoUri) {
      return res.status(400).json({
        success: false,
        error: 'MongoDB URI not configured'
      });
    }

    // 測試 MongoDB 連接
    console.log('🔄 Testing MongoDB connection with URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      ssl: true,
      tls: true,
      tlsInsecure: false,
    };
    
    const client = new MongoClient(mongoUri, options);
    console.log('🔄 Attempting to connect...');
    await client.connect();
    console.log('✅ MongoDB connection established');
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    await client.close();
    
    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      database: dbName,
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'MongoDB connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}