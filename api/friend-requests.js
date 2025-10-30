import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  ssl: true,
  tls: true,
  tlsInsecure: false,
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
    const collection = db.collection('friend_requests');
    
    if (req.method === 'GET') {
      const { toUserEmail, status } = req.query;
      
      let filter = {};
      if (toUserEmail) filter.toUserEmail = toUserEmail;
      if (status) filter.status = status;
      
      const requests = await collection
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      
      // 轉換 _id 為字符串
      const formattedRequests = requests.map(request => ({
        ...request,
        _id: request._id.toString()
      }));
      
      res.json({ success: true, data: formattedRequests });
    } 
    else if (req.method === 'POST') {
      const requestData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(requestData);
      res.json({ 
        success: true, 
        insertedId: result.insertedId.toString(),
        data: { ...requestData, _id: result.insertedId.toString() }
      });
    }
    else if (req.method === 'PUT') {
      const { id, status } = req.body;
      
      const result = await collection.updateOne(
        { id: id },
        { 
          $set: { 
            status, 
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