// Roblox AI Copilot API
// This handles requests from your plugin

export default async function handler(req, res) {
  // Allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from environment variable
    const API_KEY = process.env.AI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get request body
    const body = req.body;

    // Forward request to Google AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: body.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: body.temperature || 0.7,
            maxOutputTokens: body.max_tokens || 4096,
          }
        })
      }
    );

    const data = await response.json();

    // Check for errors
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Format response like OpenAI (so plugin works)
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return res.status(200).json({
      choices: [{
        message: {
          role: 'assistant',
          content: content
        }
      }]
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Something went wrong: ' + error.message });
  }
}
