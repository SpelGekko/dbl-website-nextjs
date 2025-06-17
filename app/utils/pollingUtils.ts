/**
 * Utility functions for implementing polling-based API requests.
 * 
 * These utilities provide a more robust way to handle long-running requests
 * compared to streaming or long-lived HTTP connections. The client makes a
 * request, receives a request ID, and then polls for the result.
 */

interface PollingOptions {
  top_k?: number;
  pollInterval?: number;
  maxAttempts?: number;
  maxPollingTime?: number;  // Maximum time to poll in milliseconds
}

interface PollingCallbacks<T> {
  onPoll?: (attempt: number, elapsedTime: number) => void;
  onFinal?: (data: T) => void;
  onError?: (error: any) => void;
  onTimeout?: () => void;
}

/**
 * Polls for the result of an analysis request.
 * 
 * @param query The query to analyze
 * @param options Polling options like interval and max attempts
 * @param callbacks Callbacks for different events during polling
 * @returns A function to cancel polling
 */
export const pollAnalysisRequest = (
  query: string, 
  options: PollingOptions = {},
  callbacks: PollingCallbacks<{ response: string, results?: any }> = {}
) => {
  let attempt = 0;
  let polling = true;
  let startTime = Date.now();
  const maxAttempts = 200; // Default to 200 polling attempts (400 seconds at 2s interval)
  const pollInterval = 2000; // Default to 2 seconds between polls
  const maxPollingTime = 420 * 1000; // Default 420 seconds (7 minutes)
  
  // Make the initial request to get a requestId
  fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query, 
      top_k: options.top_k || 5,
      usePolling: true
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data.requestId) {
      throw new Error('No request ID returned');
    }
    
    // Start polling for results
    const requestId = data.requestId;
    
    const pollForResult = () => {
      if (!polling) return;
      
      attempt++;
      const elapsedTime = Date.now() - startTime;
      
      // Check if we've hit max attempts or max polling time
      if (attempt > maxAttempts) {
        polling = false;
        callbacks.onTimeout?.();
        callbacks.onError?.(new Error('Maximum polling attempts reached'));
        return;
      }
      
      if (elapsedTime > maxPollingTime) {
        polling = false;
        callbacks.onTimeout?.();
        callbacks.onError?.(new Error('Maximum polling time exceeded'));
        return;
      }
      
      callbacks.onPoll?.(attempt, elapsedTime);
      
      // Wrap in a promise to ensure we always wait at least pollInterval between API calls
      const callApiWithDelay = async () => {
        const startCallTime = Date.now();
        
        try {
          const response = await fetch(`/api/response/${requestId}`);
          
          if (!response.ok) {
            // If it's a 202 (accepted but not ready), keep polling after delay
            if (response.status === 202) {
              const callDuration = Date.now() - startCallTime;
              const remainingDelay = Math.max(0, pollInterval - callDuration);
              
              console.log(`Response not ready (202), waiting ${remainingDelay}ms before next poll`);
              setTimeout(pollForResult, remainingDelay);
              return;
            }
            throw new Error(`API returned status code ${response.status}`);
          }
          
          const result = await response.json();
          
          // Calculate how long this API call took
          const callDuration = Date.now() - startCallTime;
          // Calculate remaining time to wait to ensure at least pollInterval between polls
          const remainingDelay = Math.max(0, pollInterval - callDuration);
          
          // Check if the result is complete
          if (result.status === 'completed') {
            polling = false;
            callbacks.onFinal?.(result);
          }
          // Check if there was an error
          else if (result.status === 'error') {
            polling = false;
            callbacks.onError?.(new Error(result.error || 'Unknown error'));
          }
          // Otherwise, keep polling after delay
          else {
            console.log(`Response pending, waiting ${remainingDelay}ms before next poll`);
            setTimeout(pollForResult, remainingDelay);
          }
        } catch (error) {
          if (polling) {
            console.error('Polling error:', error);
            // Calculate remaining time to wait
            const callDuration = Date.now() - startCallTime;
            const remainingDelay = Math.max(0, pollInterval - callDuration);
            
            // Don't stop polling on a single error, keep trying after delay
            setTimeout(pollForResult, remainingDelay);
          }
        }
      };
      
      // Call the API with delay logic
      callApiWithDelay();
    };
    
    // Start the polling loop
    pollForResult();
  })
  .catch(error => {
    callbacks.onError?.(error);
  });
  
  // Return a function that can be used to cancel polling
  return () => {
    polling = false;
    console.log('Polling cancelled');
  };
};

/**
 * Polls for the result of a bot response request.
 * 
 * @param tweet The tweet to generate a response for
 * @param options Polling options like interval and max attempts
 * @param callbacks Callbacks for different events during polling
 * @returns A function to cancel polling
 */
export const pollBotResponse = (
  tweet: string, 
  options: PollingOptions = {},
  callbacks: PollingCallbacks<{ reply: string }> = {}
) => {
  let attempt = 0;
  let polling = true;
  let startTime = Date.now();
  const maxAttempts = 200; // Default to 200 polling attempts (400 seconds at 2s interval)
  const pollInterval = 2000; // Default to 2 seconds between polls
  const maxPollingTime = 420 * 1000; // Default 420 seconds (7 minutes)
  
  // Make the initial request to get a requestId
  fetch('/api/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      tweet,
      usePolling: true
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data.requestId) {
      throw new Error('No request ID returned');
    }
    
    // Start polling for results
    const requestId = data.requestId;
    
    const pollForResult = () => {
      if (!polling) return;
      
      attempt++;
      const elapsedTime = Date.now() - startTime;
      
      // Check if we've hit max attempts or max polling time
      if (attempt > maxAttempts) {
        polling = false;
        callbacks.onTimeout?.();
        callbacks.onError?.(new Error('Maximum polling attempts reached'));
        return;
      }
      
      if (elapsedTime > maxPollingTime) {
        polling = false;
        callbacks.onTimeout?.();
        callbacks.onError?.(new Error('Maximum polling time exceeded'));
        return;
      }
      
      callbacks.onPoll?.(attempt, elapsedTime);
      
      // Wrap in a promise to ensure we always wait at least pollInterval between API calls
      const callApiWithDelay = async () => {
        const startCallTime = Date.now();
        
        try {
          const response = await fetch(`/api/response/${requestId}`);
          
          if (!response.ok) {
            // If it's a 202 (accepted but not ready), keep polling after delay
            if (response.status === 202) {
              const callDuration = Date.now() - startCallTime;
              const remainingDelay = Math.max(0, pollInterval - callDuration);
              
              console.log(`Response not ready (202), waiting ${remainingDelay}ms before next poll`);
              setTimeout(pollForResult, remainingDelay);
              return;
            }
            throw new Error(`API returned status code ${response.status}`);
          }
          
          const result = await response.json();
          
          // Calculate how long this API call took
          const callDuration = Date.now() - startCallTime;
          // Calculate remaining time to wait to ensure at least pollInterval between polls
          const remainingDelay = Math.max(0, pollInterval - callDuration);
          
          // Check if the result is complete
          if (result.status === 'completed') {
            polling = false;
            callbacks.onFinal?.({ reply: result.reply || '' });
          }
          // Check if there was an error
          else if (result.status === 'error') {
            polling = false;
            callbacks.onError?.(new Error(result.error || 'Unknown error'));
          }
          // Otherwise, keep polling after delay
          else {
            console.log(`Response pending, waiting ${remainingDelay}ms before next poll`);
            setTimeout(pollForResult, remainingDelay);
          }
        } catch (error) {
          if (polling) {
            console.error('Polling error:', error);
            // Calculate remaining time to wait
            const callDuration = Date.now() - startCallTime;
            const remainingDelay = Math.max(0, pollInterval - callDuration);
            
            // Don't stop polling on a single error, keep trying after delay
            setTimeout(pollForResult, remainingDelay);
          }
        }
      };
      
      // Call the API with delay logic
      callApiWithDelay();
    };
    
    // Start the polling loop
    pollForResult();
  })
  .catch(error => {
    callbacks.onError?.(error);
  });
  
  // Return a function that can be used to cancel polling
  return () => {
    polling = false;
    console.log('Polling cancelled');
  };
};
