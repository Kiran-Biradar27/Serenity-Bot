// This script loads face-api.js models dynamically with fallbacks
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for face-api to be fully loaded
  await new Promise(resolve => {
    const checkFaceApiLoaded = setInterval(() => {
      if (typeof window.faceapi !== 'undefined') {
        clearInterval(checkFaceApiLoaded);
        console.log('face-api.js loaded successfully!');
        resolve();
      }
    }, 100);
  });

  // Possible model locations (in order of preference)
  const MODEL_PATHS = [
    '/models',
    '/frontend/public/models',
    '/public/models'
  ];
  
  // CDN backup
  const CDN_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  
  // Helper function to check if response is valid JSON
  async function isValidJsonResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return false;
      }
      
      const text = await response.text();
      // Check if it starts with HTML, which would indicate a redirect/error page
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.warn('Received HTML instead of JSON');
        return false;
      }
      
      // Try to parse as JSON
      JSON.parse(text);
      return true;
    } catch (error) {
      console.warn('Invalid JSON response:', error);
      return false;
    }
  }
  
  async function tryLoadModels() {
    // Try each path until one works
    for (const modelPath of MODEL_PATHS) {
      try {
        console.log(`Attempting to load models from: ${modelPath}`);
        
        // Check if the directory exists by testing for the tiny_face_detector manifest
        const testPath = `${modelPath}/tiny_face_detector/model-weights_manifest.json`;
        
        try {
          const testResponse = await fetch(testPath);
          
          if (!testResponse.ok) {
            console.log(`Path ${modelPath} not valid (status ${testResponse.status}), trying next...`);
            continue;
          }
          
          // Verify it's actually JSON and not an HTML error page
          if (!(await isValidJsonResponse(testResponse))) {
            console.log(`Path ${modelPath} returned invalid JSON, trying next...`);
            continue;
          }
        } catch (fetchError) {
          console.warn(`Cannot fetch from ${modelPath}:`, fetchError);
          continue;
        }
        
        // This path seems valid, try loading models
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
            .then(() => console.log('Tiny Face Detector model loaded')),
          window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
            .then(() => console.log('Face Landmark model loaded')),
          window.faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
            .then(() => console.log('Face Expression model loaded')),
          window.faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
            .then(() => console.log('Face Recognition model loaded'))
        ]);
        
        console.log(`All face-api models loaded successfully from ${modelPath}!`);
        localStorage.setItem('faceApiModelsLoaded', 'true');
        localStorage.setItem('faceApiModelsPath', modelPath);
        return true;
      } catch (error) {
        console.warn(`Failed to load models from ${modelPath}:`, error);
      }
    }
    
    return false;
  }
  
  try {
    // Try local paths first
    const localSuccess = await tryLoadModels();
    
    // If all local paths fail, try CDN as last resort
    if (!localSuccess) {
      console.warn('All local model paths failed, falling back to CDN...');
      
      try {
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL)
            .then(() => console.log('Tiny Face Detector model loaded from CDN')),
          window.faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL)
            .then(() => console.log('Face Landmark model loaded from CDN')),
          window.faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
            .then(() => console.log('Face Expression model loaded from CDN')),
          window.faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL)
            .then(() => console.log('Face Recognition model loaded from CDN'))
        ]);
        
        console.log('All face-api models loaded successfully from CDN!');
        localStorage.setItem('faceApiModelsLoaded', 'true');
        localStorage.setItem('faceApiModelsPath', CDN_URL);
      } catch (cdnError) {
        console.error('CDN fallback also failed:', cdnError);
        localStorage.setItem('faceApiModelsLoaded', 'false');
        alert('Failed to load face detection models. Emotion detection will be disabled.');
      }
    }
  } catch (error) {
    console.error('Error in model loading process:', error);
    localStorage.setItem('faceApiModelsLoaded', 'false');
  }
}); 