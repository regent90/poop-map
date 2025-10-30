import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
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
    console.log('🔄 Attempting MongoDB connection...');
    const client = await clientPromise;
    console.log('✅ MongoDB connection successful');
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
      
      // 檢查文檔大小（MongoDB 限制為 16MB）
      const dataSize = JSON.stringify(poopData).length;
      console.log(`📊 Document size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (dataSize > 15 * 1024 * 1024) { // 15MB 安全限制
        console.warn('⚠️ Document too large, compressing photo...');
        
        // 如果有圖片且太大，嘗試壓縮
        if (poopData.photo && poopData.photo.length > 1024 * 1024) { // 1MB
          console.log('🗜️ Photo is large, may need compression');
          // 這裡可以添加圖片壓縮邏輯，或者返回錯誤
        }
      }
      
      const result = await collection.insertOne(poopData);
      console.log('✅ Document inserted successfully:', result.insertedId);
      
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
    
    // 檢查是否是 MongoDB 大小限制錯誤
    if (error.message && error.message.includes('document is larger than the maximum size')) {
      res.status(413).json({ 
        error: 'Document too large',
        message: 'The poop data (including photo) is too large for MongoDB. Please use a smaller photo.',
        code: 'DOCUMENT_TOO_LARGE'
      });
    } else if (error.code === 10334) { // MongoDB BSONObjectTooLarge error
      res.status(413).json({ 
        error: 'Document too large',
        message: 'The document exceeds MongoDB size limit (16MB). Please compress the photo.',
        code: 'BSON_TOO_LARGE'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      });
    }
  }
}