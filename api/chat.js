export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // ⚠️ PUT YOUR GROQ API KEY HERE ⚠️
  const API_KEY = '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'; // <-- REPLACE THIS!

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Parse request body
    const body = await req.json();

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || 'llama-3.3-70b-versatile',
        messages: body.messages || [],
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 4096,
      }),
    });

    const data = await response.json();

    // Return response
    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error: ' + error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
