export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 嘗試最簡單的 MongoDB 連接
    const { MongoClient } = await import('mongodb');
    
    // 使用最基本的連接字符串
    const uri = 'mongodb+srv://regent0504:regent90@cluster0.37k8lnn.mongodb.net/?retryWrites=true&w=majority';
    
    console.log('🔄 Testing basic MongoDB connection...');
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('poopmap');
    const result = await db.admin().ping();
    
    await client.close();
    
    res.status(200).json({
      success: true,
      message: 'Basic MongoDB connection works!',
      ping: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB Basic Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Basic MongoDB connection failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}