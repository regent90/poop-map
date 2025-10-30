const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  // 設置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'poopmap');
    const collection = db.collection('likes');
    
    if (req.method === 'GET') {
      const { poopId } = req.query;
      
      if (!poopId) {
        return res.status(400).json({ error: 'poopId is required' });
      }
      
      const likes = await collection
        .find({ poopId })
        .sort({ timestamp: -1 }) // 最新的按讚在前
        .toArray();
      
      // 轉換 _id 為字符串
      const formattedLikes = likes.map(like => ({
        ...like,
        _id: like._id.toString()
      }));
      
      res.json({ success: true, data: formattedLikes });
    } 
    else if (req.method === 'POST') {
      const { poopId, userId, userEmail, userName, userPicture } = req.body;
      
      if (!poopId || !userId || !userEmail || !userName) {
        return res.status(400).json({ 
          error: 'Missing required fields: poopId, userId, userEmail, userName' 
        });
      }
      
      // 檢查是否已經按讚
      const existingLike = await collection.findOne({ poopId, userId });
      
      if (existingLike) {
        return res.status(409).json({ 
          error: 'User already liked this poop',
          code: 'ALREADY_LIKED'
        });
      }
      
      const likeData = {
        id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        poopId,
        userId,
        userEmail,
        userName,
        userPicture: userPicture || null,
        timestamp: Math.floor(Date.now() / 1000), // 使用秒級時間戳
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(likeData);
      console.log('👍 Like added:', result.insertedId);
      
      res.json({ 
        success: true, 
        insertedId: result.insertedId.toString(),
        data: { ...likeData, _id: result.insertedId.toString() }
      });
    }
    else if (req.method === 'DELETE') {
      const { poopId, userId } = req.query;
      
      if (!poopId || !userId) {
        return res.status(400).json({ error: 'poopId and userId are required' });
      }
      
      const result = await collection.deleteOne({ poopId, userId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Like not found' });
      }
      
      console.log('👎 Like removed:', { poopId, userId });
      res.json({ 
        success: true, 
        deletedCount: result.deletedCount
      });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Likes API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}