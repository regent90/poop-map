export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { MongoClient } = await import('mongodb');
    
    // 最簡單的連接字符串
    const uri = 'mongodb+srv://regent0504:regent90@cluster0.37k8lnn.mongodb.net/?retryWrites=true&w=majority';
    
    console.log('🔄 Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('poopmap');
    const collection = db.collection('poops');
    
    if (req.method === 'GET') {
      const { privacy } = req.query;
      
      let filter = {};
      if (privacy === 'public') {
        filter.privacy = 'public';
      }
      
      const poops = await collection
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      
      await client.close();
      
      res.json({ 
        success: true, 
        data: poops.map(poop => ({
          ...poop,
          _id: poop._id.toString()
        }))
      });
    } 
    else if (req.method === 'POST') {
      const poopData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(poopData);
      await client.close();
      
      res.json({ 
        success: true, 
        insertedId: result.insertedId.toString(),
        data: { ...poopData, _id: result.insertedId.toString() }
      });
    }
    else {
      await client.close();
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Simple API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}