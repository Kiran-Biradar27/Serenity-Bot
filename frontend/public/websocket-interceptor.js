/**
 * WebSocket Interceptor for Development
 * 
 * This script intercepts and silences webpack-dev-server WebSocket connection errors
 * that appear in the console during development. It has no effect on actual
 * WebSocket functionality, just prevents the error logs from cluttering the console.
 */

(function() {
  // Only run in development mode
  const isDevMode = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
  
  if (!isDevMode) return;

  console.log('WebSocket interceptor active (development only)');
  
  // Store the original console.error function
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error to filter out WebSocket connection error messages
  console.error = function(...args) {
    // Check if this is a WebSocket error from webpack-dev-server (port 3000)
    const errorString = args.join(' ');
    if ((errorString.includes('WebSocket connection to \'ws://localhost:3000/ws\'') || 
         errorString.includes('WebSocket connection')) && 
        errorString.includes('failed')) {
      // Development-only WebSocket error, don't show it
      console.log('Development WebSocket warning suppressed (webpack-dev-server hot reload)');
      return;
    }
    
    // Otherwise, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Also override console.warn for WebSocket warnings
  console.warn = function(...args) {
    // Check if this is a WebSocket warning from webpack-dev-server (port 3000)
    const warnString = args.join(' ');
    if (warnString.includes('WebSocket') && 
        (warnString.includes('localhost:3000') || warnString.includes('webpack'))) {
      // Development-only WebSocket warning, don't show it
      return;
    }
    
    // Otherwise, pass through to the original console.warn
    originalConsoleWarn.apply(console, args);
  };
  
  // Also override the WebSocket constructor to handle connection errors gracefully
  // This prevents the red error message in the console
  if (window.WebSocket) {
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      const ws = new OriginalWebSocket(url, protocols);
      
      // If this is a webpack-dev-server WebSocket (port 3000), handle errors silently
      if (typeof url === 'string' && url.includes('localhost:3000/ws')) {
        const originalOnError = ws.onerror;
        
        ws.onerror = function(event) {
          // Silently handle the error for webpack-dev-server connections
          console.log('Development WebSocket error handled (webpack-dev-server)');
          
          // Still call original error handler if it exists
          if (originalOnError && typeof originalOnError === 'function') {
            originalOnError.call(ws, event);
          }
        };
      }
      
      return ws;
    };
    
    // Copy all properties from the original WebSocket
    for (const prop in OriginalWebSocket) {
      if (OriginalWebSocket.hasOwnProperty(prop)) {
        window.WebSocket[prop] = OriginalWebSocket[prop];
      }
    }
    
    window.WebSocket.prototype = OriginalWebSocket.prototype;
  }
})(); 