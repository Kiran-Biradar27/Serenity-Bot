/**
 * Error handling utility functions
 */

/**
 * Log errors with contextual information to help with debugging
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {Object} additionalData - Any additional data that might help with debugging
 */
export const logError = (error, context, additionalData = {}) => {
  console.error(`Error in ${context}:`, error);
  
  if (Object.keys(additionalData).length > 0) {
    console.error('Additional debug data:', additionalData);
  }
  
  // Could send to an error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorService(error, context, additionalData);
  }
};

/**
 * Handle face-api specific errors
 * @param {Error} error - The error object
 * @param {string} operation - The operation that was being performed
 */
export const handleFaceApiError = (error, operation) => {
  let errorMessage = `Face API error during ${operation}`;
  
  // Check for common face-api errors
  if (error.message && error.message.includes('no faces detected')) {
    errorMessage = 'No faces detected in the image';
  } else if (error.message && error.message.includes('model')) {
    errorMessage = 'Face detection models not properly loaded';
    
    // Try to reload models
    if (window.faceapi) {
      console.log('Attempting to reload face-api models...');
      const modelsLoadedStatus = localStorage.getItem('faceApiModelsLoaded');
      
      if (modelsLoadedStatus === 'true') {
        const storedPath = localStorage.getItem('faceApiModelsPath') || 'https://justadudewhohacks.github.io/face-api.js/models';
        
        // Clear and set again to force reload on page refresh
        localStorage.setItem('faceApiModelsLoaded', 'false');
        
        // Suggest a reload
        console.log(`Please refresh the page to reload face-api models from ${storedPath}`);
      }
    }
  }
  
  // Log the formatted error
  logError(error, 'face-api', { 
    operation,
    modelsLoaded: localStorage.getItem('faceApiModelsLoaded') === 'true',
    modelPath: localStorage.getItem('faceApiModelsPath')
  });
  
  return errorMessage;
};

/**
 * Handle WebSocket related errors
 * @param {Error} error - The error object
 * @param {string} url - The WebSocket URL
 */
export const handleWebSocketError = (error, url) => {
  // Ignore webpack-dev-server WebSocket errors
  if (url && url.includes('localhost:3000/ws')) {
    console.log('Development WebSocket warning suppressed (webpack-dev-server hot reload)');
    return;
  }
  
  logError(error, 'WebSocket', { url });
};

export default {
  logError,
  handleFaceApiError,
  handleWebSocketError
}; 