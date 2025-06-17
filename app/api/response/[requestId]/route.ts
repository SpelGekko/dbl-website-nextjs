import { NextResponse } from 'next/server';
import { readResponse, responseExists } from '@/app/utils/responseUtils';

// Define the route handler with NextRequest
export async function GET(
  request: Request,
  context: any // <-- Changed the type of context to 'any'
) {
  // We'll cast params to the expected type for safer access within the function body
  const { requestId } = context.params as { requestId: string }; 

  if (!requestId) {
    return NextResponse.json(
      { error: "Missing required parameter: requestId" },
      { status: 400 }
    );
  }

  try {
    // Check if the response exists
    const exists = await responseExists(requestId);
    
    if (!exists) {
      return NextResponse.json(
        { status: 'pending', message: 'Response is still being processed' },
        { status: 202 }
      );
    }

    // Read the response
    const response = await readResponse(requestId);
    
    if (!response) {
      return NextResponse.json(
        { error: "Failed to read response data" },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching response for ${requestId}:`, error);
    return NextResponse.json(
      { error: "An error occurred while fetching the response" },
      { status: 500 }
    );
  }
}