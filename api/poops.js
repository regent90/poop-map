import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

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
    const collection = db.collection('poops');
    
    if (req.method === 'GET') {
      const { userId, privacy, friendEmails } = req.query;
      
      let filter = {};
      
      // 根據查詢參數構建過濾器
      if (userId) {
        filter.userId = userId;
      } else if (friendEmails) {
        const emails = Array.isArray(friendEmails) ? friendEmails : [friendEmails];
        filter = {
          userId: { $in: emails },
          privacy: { $in: ['friends', 'public'] }
        };
      } else if (privacy === 'public') {
        filter.privacy = 'public';
      }
      
      const poops = await collection
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
      
      // 轉換 _id 為字符串
      const formattedPoops = poops.map(poop => ({
        ...poop,
        _id: poop._id.toString()
      }));
      
      res.json({ success: true, data: formattedPoops });
    } 
    else if (req.method === 'POST') {
      const poopData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(poopData);
      res.json({ 
        success: true, 
        insertedId: result.insertedId.toString(),
        data: { ...poopData, _id: result.insertedId.toString() }
      });
    }
    else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      const result = await collection.updateOne(
        { id: id },
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
      const { id } = req.query;
      
      const result = await collection.deleteOne({ id: id });
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