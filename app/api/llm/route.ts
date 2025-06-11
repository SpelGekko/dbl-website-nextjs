import { NextResponse } from 'next/server';

// API Configuration
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY; 

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!API_BASE_URL || !API_KEY) {
      console.error("Missing required environment variables: API_URL or API_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Extract parameters from the request
    const body = await req.json();
    
    // Handle both query and question to make it more robust
    const query = body.query || body.question;
    const top_k = body.top_k || 5;

    if (!query) {
      return NextResponse.json(
        { error: "Missing required parameter: query" },
        { status: 400 }
      );
    }

    // Fixed endpoint for analysis
    const endpoint = "/analyze";

    // Prepare request payload
    const payload = {
      query,
      top_k: Number(top_k)
    };

    console.log(`Sending request to ${API_BASE_URL}${endpoint}`);

    // Set up headers with API key
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    };

    try {
      // Call the external API - no timeout
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `API returned status code ${response.status}`;
        console.error("API Error:", errorMessage);
        
        return NextResponse.json(
          { error: errorMessage, response: "Sorry, I encountered an error while processing your request." },
          { status: response.status }
        );
      }

      // Return the API response data
      const data = await response.json();
      
      // Ensure we have a valid response format
      if (!data.response && data.results) {
        // Handle alternative response formats
        return NextResponse.json({
          response: typeof data.results === 'string' ? data.results : JSON.stringify(data.results)
        });
      }
      
      return NextResponse.json(data);
    } catch (error: unknown) {
      // Handle other errors
      if (error instanceof Error) {
        console.error(`API request error: ${error.message}`);
        
        // Log additional details if available
        if ('cause' in error) {
          console.error("Error cause:", (error as any).cause);
        }
      }
      
      throw error; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request", response: "I'm having trouble connecting to the service right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}