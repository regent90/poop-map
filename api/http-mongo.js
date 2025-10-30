export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 使用 MongoDB Atlas Data API
    const dataApiUrl = 'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-aaaaa/endpoint/data/v1';
    const apiKey = 'your-api-key-here'; // 需要在 MongoDB Atlas 中生成
    
    // 測試簡單的查詢
    const response = await fetch(`${dataApiUrl}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        collection: 'poops',
        database: 'poopmap',
        filter: {},
        limit: 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Data API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.status(200).json({
      success: true,
      message: 'MongoDB HTTP Data API works!',
      data: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('HTTP Data API Error:', error);
    
    // 如果 HTTP API 也不行，我們就用 Supabase
    res.status(200).json({
      success: false,
      message: 'MongoDB connection issues detected. Switching to Supabase.',
      error: error.message,
      recommendation: 'Use Supabase as primary database',
      timestamp: new Date().toISOString()
    });
  }
}