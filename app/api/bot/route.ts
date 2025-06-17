import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, saveResponse } from '@/app/utils/responseUtils';

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
    const usePolling = body.usePolling || false; // Optional flag to use polling

    if (!tweet) {
      return NextResponse.json(
        { error: "Missing required parameter: tweet" },
        { status: 400 }
      );
    }    // Updated endpoint for PR response
    const endpoint = "/request/pr";

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
              reply: "Sorry, I couldn't generate a response at this time."
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
                reply: "Generating response...",
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
                  reply: "Sorry, it's taking longer than expected to generate a response. Please try again later.",
                  timestamp: new Date().toISOString()
                });
                return;
              }
              
              // If we have a completed result, process and save it
              if (resultData && resultData.response) {
                // The response structure should match what's in the backend code
                const responseObject = resultData.response;
                
                let reply = "No response generated";
                
                // Try to extract the actual response content
                if (typeof responseObject === 'object') {
                  // If response is an object, look for nested response or results
                  if (responseObject.response) {
                    reply = responseObject.response;
                  } else if (responseObject.results) {
                    reply = typeof responseObject.results === 'string' ? 
                      responseObject.results : JSON.stringify(responseObject.results);
                  }
                } else if (typeof responseObject === 'string') {
                  // If response is directly a string
                  reply = responseObject;
                }
                
                console.log("Final reply extracted:", reply);
                
                // Save the processed response
                await saveResponse(requestId, {
                  status: 'completed',
                  reply,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Fallback for unexpected response format
                await saveResponse(requestId, {
                  status: 'completed',
                  reply: "Received a response but couldn't extract the generated reply.",
                  timestamp: new Date().toISOString()
                });
              }
            } catch (pollError) {
              console.error("Error polling external API for results:", pollError);
              await saveResponse(requestId, {
                status: 'error',
                error: pollError instanceof Error ? pollError.message : "Error retrieving results",
                reply: "I'm having trouble retrieving the response right now.",
                timestamp: new Date().toISOString()
              });
            }
          } else {
            // Format the response for the bot API (backward compatibility)
            let reply = "No response generated";
            
            if (data.response) {
              reply = data.response;
            } else if (data.results) {
              reply = typeof data.results === 'string' ? data.results : JSON.stringify(data.results);
            }
            
            // Save the response to the file system
            await saveResponse(requestId, {
              status: 'completed',
              reply,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Background process error:", error);
          
          // Save the error
          await saveResponse(requestId, {
            status: 'error',
            error: error instanceof Error ? error.message : "Unknown error",
            reply: "I'm having trouble generating a response right now.",
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
    } catch (error) {
      console.error("API request error:", error);
      
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