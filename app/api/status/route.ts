import { NextResponse } from 'next/server';

// API Configuration
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export async function GET() {
  try {
    // Validate environment variables
    if (!API_BASE_URL || !API_KEY) {
      console.error("Missing required environment variables: API_URL or API_KEY");
      return NextResponse.json(
        { 
          status: 'error',
          message: "Server configuration error: Missing API credentials",
          configured: false
        },
        { status: 500 }
      );
    }

    // Set up headers with API key
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    };

    try {
      // Send a lightweight request to the API to check its status
      const statusCheckUrl = `${API_BASE_URL}/status`; // Updated to use the correct /status endpoint
      
      console.log(`Checking API status at ${statusCheckUrl}`);
      
      // Set a timeout to avoid hanging if the API is unresponsive
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(statusCheckUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return NextResponse.json(
          { 
            status: 'error',
            message: `API returned status code ${response.status}`,
            configured: true,
            available: false
          },
          { status: 200 } // Still return 200 to the client - the API being down is not an error in our service
        );
      }

      // Return success status
      return NextResponse.json(
        { 
          status: 'ok',
          message: 'API is running and accessible',
          timestamp: new Date().toISOString(),
          configured: true,
          available: true
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("API status check failed:", error);
      
      // Determine if it was a timeout
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      return NextResponse.json(
        { 
          status: 'error',
          message: isTimeout ? 'API status check timed out' : 'API connection failed',
          configured: true,
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 200 } // Still return 200 to the client
      );
    }
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error during status check',
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback POST method to handle incorrect method calls
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET for status checks." },
    { status: 405 }
  );
}