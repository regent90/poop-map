module.exports = async function handler(req, res) {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    
    res.json({
      success: true,
      message: 'Vercel Function is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri: !!mongoUri,
        dbName: dbName || 'not set',
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Test API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};