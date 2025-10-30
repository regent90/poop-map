import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'poopmap');
    const collection = db.collection('friends');
    
    if (req.method === 'GET') {
      const { userId, status } = req.query;
      
      let filter = {};
      if (userId) filter.userId = userId;
      if (status) filter.status = status;
      
      const friends = await collection
        .find(filter)
        .sort({ addedAt: -1 })
        .toArray();
      
      // 轉換 _id 為字符串
      const formattedFriends = friends.map(friend => ({
        ...friend,
        _id: friend._id.toString()
      }));
      
      res.json({ success: true, data: formattedFriends });
    } 
    else if (req.method === 'POST') {
      const friendData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 使用 upsert 來避免重複
      const result = await collection.replaceOne(
        { 
          userId: friendData.userId, 
          friendEmail: friendData.friendEmail 
        },
        friendData,
        { upsert: true }
      );
      
      res.json({ 
        success: true, 
        upsertedId: result.upsertedId?.toString(),
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }
    else if (req.method === 'PUT') {
      const { userId, friendEmail, ...updateData } = req.body;
      
      const result = await collection.updateOne(
        { userId, friendEmail },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );
      
      res.json({ 
        success: true, 
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    }
    else if (req.method === 'DELETE') {
      const { userId, friendEmail } = req.query;
      
      if (!userId || !friendEmail) {
        return res.status(400).json({ 
          error: 'Missing required parameters: userId and friendEmail' 
        });
      }
      
      const result = await collection.deleteOne({ 
        userId: userId, 
        friendEmail: friendEmail 
      });
      
      res.json({ 
        success: true, 
        deletedCount: result.deletedCount
      });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}