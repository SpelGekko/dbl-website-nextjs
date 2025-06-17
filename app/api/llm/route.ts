import { NextResponse } from 'next/server';
import { generateRequestId, saveResponse } from '@/app/utils/responseUtils';

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
    const usePolling = body.usePolling || false; // Flag for polling-based approach

    if (!query) {
      return NextResponse.json(
        { error: "Missing required parameter: query" },
        { status: 400 }
      );
    }    // Updated endpoint for analysis
    const endpoint = "/request/analyze";

    // Prepare request payload
    const payload = {
      query,
      top_k: Number(top_k)
    };

    console.log(`Sending request to ${API_BASE_URL}${endpoint}`);

    // Set up headers with API key
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY as string
    };

    // For polling-based requests, generate a request ID and initiate the process
    if (usePolling) {
      // Generate a unique request ID
      const requestId = generateRequestId();
      
      // Start a background process to handle the request
      (async () => {
        try {
          const apiResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          
          if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => null);
            const errorMessage = errorData?.detail || `API returned status code ${apiResponse.status}`;
            console.error("API Error:", errorMessage);
            
            // Save the error response
            await saveResponse(requestId, {
              status: 'error',
              error: errorMessage,
              response: "Sorry, I encountered an error while processing your request."
            });
            return;
          }
            // Process successful response
          const data = await apiResponse.json();            // Check if the response includes a request_id
          if (data.request_id) {
            // For the new API format, we need to poll the external API
            try {
              console.log(`Backend request_id received: ${data.request_id}`);
              
              // Save initial pending status
              await saveResponse(requestId, {
                status: 'pending',
                response: "Your request is being processed...",
                timestamp: new Date().toISOString()
              });              // Poll until completion or timeout
              let resultData;
              let completed = false;
              let attempts = 0;
              const maxAttempts = 120; // ~240 seconds with 2s interval
              const pollInterval = 2000; // 2 seconds between polls
              
              // Poll until the request is completed or max attempts reached
              while (!completed && attempts < maxAttempts) {
                attempts++;
                
                // Always wait between polls
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                
                console.log(`Polling attempt ${attempts}/${maxAttempts} for backend request_id ${data.request_id}`);
                
                const resultResponse = await fetch(`${API_BASE_URL}/response/${data.request_id}`, {
                  method: 'GET',
                  headers
                });
                
                if (!resultResponse.ok) {
                  console.log(`Poll attempt ${attempts} failed with status ${resultResponse.status}`);
                  continue; // Keep trying even if we get errors
                }
                
                resultData = await resultResponse.json();
                console.log(`Poll attempt ${attempts} result:`, JSON.stringify(resultData, null, 2));
                
                // Check if the request is completed
                if (resultData.completed === true) {
                  completed = true;
                  console.log(`Request ${data.request_id} completed after ${attempts} attempts`);
                  break;
                }
              }
                if (!completed) {
                console.error(`Request ${data.request_id} timed out after ${maxAttempts} polling attempts`);
                await saveResponse(requestId, {
                  status: 'error',
                  error: `Request timed out after ${maxAttempts} polling attempts`,
                  response: "Sorry, your request is taking longer than expected. Please try again later.",
                  timestamp: new Date().toISOString()
                });
                return;
              }
              
              // If we have a completed result, process and save it
              if (resultData && resultData.response) {
                // The response structure should match what's in the backend code
                // The response might be nested in resultData.response.response
                const responseObject = resultData.response;
                
                let finalResponse = "Analysis completed with no results.";
                let results = null;
                
                // Try to extract the actual response content
                if (typeof responseObject === 'object') {
                  // If response is an object, look for nested response or results
                  if (responseObject.response) {
                    finalResponse = responseObject.response;
                  }
                  if (responseObject.results) {
                    results = responseObject.results;
                    // If no response but we have results, use those as the response
                    if (!finalResponse || finalResponse === "Analysis completed with no results.") {
                      finalResponse = typeof results === 'string' ? results : JSON.stringify(results);
                    }
                  }
                } else if (typeof responseObject === 'string') {
                  // If response is directly a string
                  finalResponse = responseObject;
                }
                
                console.log("Final response extracted:", finalResponse);
                
                // Save the processed response
                await saveResponse(requestId, {
                  status: 'completed',
                  response: finalResponse,
                  results: results,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Fallback for unexpected response format
                await saveResponse(requestId, {
                  status: 'completed',
                  response: "Received a response but couldn't extract the analysis results.",
                  timestamp: new Date().toISOString()
                });
              }
            } catch (pollError) {
              console.error("Error polling external API for results:", pollError);
              await saveResponse(requestId, {
                status: 'error',
                error: pollError instanceof Error ? pollError.message : "Error retrieving results",
                response: "Sorry, I encountered an error while retrieving your analysis results.",
                timestamp: new Date().toISOString()
              });
            }
          } else {
            // Handle direct response (for backward compatibility)
            await saveResponse(requestId, {
              status: 'completed',
              response: data.response || (data.results ? 
                (typeof data.results === 'string' ? data.results : JSON.stringify(data.results)) : 
                "Analysis completed with no results."),
              results: data.results,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Background process error:", error);
          
          // Save the error
          await saveResponse(requestId, {
            status: 'error',
            error: error instanceof Error ? error.message : "Unknown error",
            response: "An error occurred while processing your request.",
            timestamp: new Date().toISOString()
          });
        }
      })();
      
      // Return the request ID immediately
      return NextResponse.json({
        requestId,
        status: 'pending',
        message: 'Your request is being processed. Poll the /api/response/{requestId} endpoint for results.'
      });
    }

    // Standard JSON response (non-polling)
    try {
      // Call the API directly
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      // Handle API error responses
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
    } catch (error) {
      console.error("API request error:", error);
      
      return NextResponse.json(
        { error: "An error occurred while processing the request", response: "I'm having trouble connecting to the service right now. Please try again in a moment." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request", response: "I'm having trouble connecting to the service right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}