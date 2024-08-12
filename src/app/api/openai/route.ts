import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    
    // Extract the 'messages' property from the body
    const { messages } = body;

    // Check if messages array is present
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Use the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Verify API Key is set
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not set' }, { status: 500 });
    }

    // Make a request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages.map(message => ({
          role: message.sender.toLowerCase(), // Convert sender to lowercase ('user' or 'assistant')
          content: message.text
        })),
        max_tokens: 150,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch response from OpenAI: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response from AI';

    // Return the AI response
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    // Handle errors and return a JSON response with an error message
    console.error('Error during API call:', error);
    return NextResponse.json({ error: 'An error occurred while contacting the AI.' }, { status: 500 });
  }
}
