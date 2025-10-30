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
    const collection = db.collection('comments');
    
    if (req.method === 'GET') {
      const { poopId } = req.query;
      
      if (!poopId) {
        return res.status(400).json({ error: 'poopId is required' });
      }
      
      const comments = await collection
        .find({ poopId })
        .sort({ timestamp: 1 }) // 按時間順序排列
        .toArray();
      
      // 轉換 _id 為字符串
      const formattedComments = comments.map(comment => ({
        ...comment,
        _id: comment._id.toString()
      }));
      
      res.json({ success: true, data: formattedComments });
    } 
    else if (req.method === 'POST') {
      const { poopId, userId, userEmail, userName, content, userPicture } = req.body;
      
      if (!poopId || !userId || !userEmail || !userName || !content) {
        return res.status(400).json({ 
          error: 'Missing required fields: poopId, userId, userEmail, userName, content' 
        });
      }
      
      const commentData = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        poopId,
        userId,
        userEmail,
        userName,
        content,
        userPicture: userPicture || null,
        timestamp: Math.floor(Date.now() / 1000), // 使用秒級時間戳，與現有系統一致
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(commentData);
      console.log('✅ Comment added:', result.insertedId);
      
      res.json({ 
        success: true, 
        insertedId: result.insertedId.toString(),
        data: { ...commentData, _id: result.insertedId.toString() }
      });
    }
    else if (req.method === 'DELETE') {
      const { commentId } = req.query;
      
      if (!commentId) {
        return res.status(400).json({ error: 'commentId is required' });
      }
      
      const result = await collection.deleteOne({ id: commentId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      console.log('🗑️ Comment deleted:', commentId);
      res.json({ 
        success: true, 
        deletedCount: result.deletedCount
      });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Comments API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}