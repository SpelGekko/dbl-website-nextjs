// A utility function to handle SSE connection for LLM requests
export const connectToRequestStream = (requestId: string, callbacks: {
  onKeepalive?: (elapsedTime: number) => void;
  onUpdate?: (data: { status: string, message: string, progress: number }) => void;
  onPartialResponse?: (data: { text: string }) => void; // New callback for partial responses
  onFinal?: (data: { status: string, response: string }) => void;
  onError?: (error: any) => void;
}) => {
  const eventSource = new EventSource(`/api/request-stream/${requestId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.event_type) {
        case "keepalive":
          callbacks.onKeepalive?.(data.elapsed_time);
          break;
        case "update":
          callbacks.onUpdate?.(data);
          break;
        case "partial":
          // Handle partial response updates for incremental UI updates
          callbacks.onPartialResponse?.(data);
          break;
        case "final":
          // When we get the final event, the actual response will be in data.response
          callbacks.onFinal?.(data);
          eventSource.close(); // Close the connection when done
          break;
        case "error":
          callbacks.onError?.(new Error(data.message));
          eventSource.close();
          break;
      }
    } catch (error) {
      callbacks.onError?.(error);
    }
  };
  
  eventSource.onerror = (error) => {
    callbacks.onError?.(error);
    eventSource.close();
  };

  // Return a function to close the connection
  return () => eventSource.close();
};

// New utility function to handle direct streaming from the API
export const streamAnalysisRequest = (
  query: string, 
  options: { top_k?: number } = {},
  callbacks: {
    onKeepalive?: (elapsedTime: number, message: string, progress: number) => void;
    onUpdate?: (data: { status: string, message: string, progress: number }) => void;
    onPartial?: (data: { text: string }) => void; // New callback for partial responses
    onFinal?: (data: { response: string, results?: any }) => void;
    onError?: (error: any) => void;
  }
) => {
  // Create an AbortController to allow cancellation
  const controller = new AbortController();
  const signal = controller.signal;

  // Start the streaming request
  fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query, 
      top_k: options.top_k || 5,
      useStreaming: true
    }),
    signal, // Use the AbortController signal
  }).then(response => {
    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }
    
    // Set up a reader for the stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    // Process the stream
    function processStream(): Promise<void> {
      return reader.read().then(({ done, value }) => {
        if (signal.aborted) {
          reader.cancel();
          return;
        }

        if (done) {
          // Process any remaining data in the buffer
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer);
              if (data.status === 'completed') {
                callbacks.onFinal?.(data);
              }
            } catch (e) {
              console.error('Error parsing final buffer:', e);
            }
          }
          return;
        }
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        // Process each complete line
        lines.forEach(line => {
          if (line.trim() === '') return;
          
          try {
            const data = JSON.parse(line);
            
            if (data.keepalive && callbacks.onKeepalive) {
              callbacks.onKeepalive(data.elapsed, data.message, data.progress);
            } else if (data.status === 'processing' && callbacks.onUpdate) {
              callbacks.onUpdate(data);
            } else if (data.partial && callbacks.onPartial) {
              // Handle partial response text for incremental UI updates
              callbacks.onPartial(data);
            } else if (data.status === 'completed' && callbacks.onFinal) {
              callbacks.onFinal(data);
              // No need to continue reading
              reader.cancel();
              return;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, line);
          }
        });
        
        // Continue reading
        return processStream();
      }).catch(error => {
        if (!signal.aborted) {
          callbacks.onError?.(error);
        }
      });
    }
    
    // Start reading the stream
    return processStream();
  }).catch(error => {
    if (!signal.aborted) {
      callbacks.onError?.(error);
    }
  });
  
  // Return a function that can be used to cancel the request
  return () => {
    controller.abort();
    console.log('Request cancelled');
  };
};

// Utility function to handle streaming bot replies
export const streamBotResponse = (
  tweet: string, 
  callbacks: {
    onKeepalive?: (elapsedTime: number, message: string, progress: number) => void;
    onUpdate?: (data: { status: string, message: string, progress: number }) => void;
    onPartial?: (data: { text: string }) => void; // New callback for partial responses
    onFinal?: (data: { reply: string }) => void;
    onError?: (error: any) => void;
  }
) => {
  // Create an AbortController to allow cancellation
  const controller = new AbortController();
  const signal = controller.signal;

  // Start the streaming request
  fetch('/api/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      tweet,
      useStreaming: true
    }),
    signal, // Use the AbortController signal
  }).then(response => {
    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }
    
    // Set up a reader for the stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    // Process the stream
    function processStream(): Promise<void> {
      return reader.read().then(({ done, value }) => {
        if (signal.aborted) {
          reader.cancel();
          return;
        }

        if (done) {
          // Process any remaining data in the buffer
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer);
              if (data.status === 'completed') {
                callbacks.onFinal?.({ reply: data.response || '' });
              }
            } catch (e) {
              console.error('Error parsing final buffer:', e);
            }
          }
          return;
        }
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        // Process each complete line
        lines.forEach(line => {
          if (line.trim() === '') return;
          
          try {
            const data = JSON.parse(line);
            
            if (data.keepalive && callbacks.onKeepalive) {
              callbacks.onKeepalive(data.elapsed, data.message, data.progress);
            } else if (data.status === 'processing' && callbacks.onUpdate) {
              callbacks.onUpdate(data);
            } else if (data.partial && callbacks.onPartial) {
              // Handle partial response text for incremental UI updates
              callbacks.onPartial(data);
            } else if (data.status === 'completed' && callbacks.onFinal) {
              callbacks.onFinal({ reply: data.response || '' });
              // No need to continue reading
              reader.cancel();
              return;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e, line);
          }
        });
        
        // Continue reading
        return processStream();
      }).catch(error => {
        if (!signal.aborted) {
          callbacks.onError?.(error);
        }
      });
    }
    
    // Start reading the stream
    return processStream();
  }).catch(error => {
    if (!signal.aborted) {
      callbacks.onError?.(error);
    }
  });
  
  // Return a function that can be used to cancel the request
  return () => {
    controller.abort();
    console.log('Bot request cancelled');
  };
};
