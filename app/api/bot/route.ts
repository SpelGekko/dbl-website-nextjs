import { NextRequest, NextResponse } from 'next/server';

// API Configuration
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY; 

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const tweet = body.tweet;

    if (!tweet) {
      return NextResponse.json(
        { error: "Missing required parameter: tweet" },
        { status: 400 }
      );
    }

    // Fixed endpoint for PR response
    const endpoint = "/pr-response";

    // Prepare request payload
    const payload = {
      query: tweet // Use the tweet as the query for the PR response
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
          { error: errorMessage, reply: "Sorry, I couldn't generate a response at this time." },
          { status: response.status }
        );
      }

      // Return the API response data
      const data = await response.json();
      
      // Format the response for the bot API
      // Assuming the PR response API returns a 'response' or 'results' field
      let reply = "No response generated";
      
      if (data.response) {
        reply = data.response;
      } else if (data.results) {
        reply = typeof data.results === 'string' ? data.results : JSON.stringify(data.results);
      }
      
      return NextResponse.json({ reply });
    } catch (error: unknown) {
      // Handle other errors
      if (error instanceof Error) {
        console.error(`API request error: ${error.message}`);
        
        // Log additional details if available
        if ('cause' in error) {
          console.error("Error cause:", (error as any).cause);
        }
      }
      
      return NextResponse.json(
        { error: "An error occurred while processing the request", reply: "I'm having trouble generating a response right now." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Invalid request or server error", reply: "Sorry, I couldn't understand your request." },
      { status: 400 }
    );
  }
}