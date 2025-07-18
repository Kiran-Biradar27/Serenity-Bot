// Face-API Test Script
// This script tests if face-api.js models are working correctly

document.addEventListener('DOMContentLoaded', async () => {
  // Create test container only on localhost/development
  const isDevMode = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
  
  if (isDevMode) {
    setTimeout(() => {
      try {
        createTestInterface();
      } catch (error) {
        console.error('Error creating test interface:', error);
      }
    }, 2000); // Give face-api time to load
  }
  
  function createTestInterface() {
    // Check if face-api is loaded
    if (typeof window.faceapi === 'undefined') {
      console.error('face-api.js is not loaded');
      return;
    }
    
    // Check if models are loaded from localStorage
    const modelsLoaded = localStorage.getItem('faceApiModelsLoaded') === 'true';
    if (!modelsLoaded) {
      console.warn('Face-api models not yet loaded according to localStorage');
      return;
    }
    
    console.log('Creating face-api test interface');
    
    // Create container
    const container = document.createElement('div');
    container.id = 'face-api-test';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    container.style.display = 'none'; // Hidden by default
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Test Face Detection';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.zIndex = '9998';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.border = 'none';
    toggleButton.style.backgroundColor = '#4CAF50';
    toggleButton.style.color = 'white';
    toggleButton.style.cursor = 'pointer';
    
    toggleButton.onclick = () => {
      if (container.style.display === 'none') {
        container.style.display = 'block';
        startTest();
      } else {
        container.style.display = 'none';
        stopTest();
      }
    };
    
    // Create test interface
    const title = document.createElement('h3');
    title.textContent = 'Face-API Test';
    title.style.margin = '0 0 10px 0';
    
    // Create video element
    const video = document.createElement('video');
    video.width = 320;
    video.height = 240;
    video.autoplay = true;
    video.muted = true;
    video.style.borderRadius = '5px';
    
    // Create canvas for drawing face detection results
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.position = 'absolute';
    canvas.style.top = '43px'; // Below title
    canvas.style.left = '10px';
    
    // Create status element
    const status = document.createElement('div');
    status.textContent = 'Status: Ready';
    status.style.marginTop = '10px';
    status.style.fontFamily = 'monospace';
    
    // Add elements to container
    container.appendChild(title);
    container.appendChild(video);
    container.appendChild(canvas);
    container.appendChild(status);
    
    // Add container and button to document
    document.body.appendChild(toggleButton);
    document.body.appendChild(container);
    
    // Video feed and detection variables
    let stream = null;
    let detectionInterval = null;
    
    // Start test function
    async function startTest() {
      status.textContent = 'Status: Starting...';
      
      try {
        // Get webcam stream
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240 } 
        });
        video.srcObject = stream;
        
        status.textContent = 'Status: Camera active';
        
        // Start detection loop
        detectionInterval = setInterval(async () => {
          if (video.readyState === 4) { // HAVE_ENOUGH_DATA
            try {
              // Check if face-api is still available
              if (typeof window.faceapi === 'undefined') {
                throw new Error('face-api.js is not available');
              }
              
              // Detect faces
              const detections = await window.faceapi
                .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();
              
              // Draw results
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (detections.length > 0) {
                  // Get the strongest emotion
                  const expressions = detections[0].expressions;
                  let strongestEmotion = 'neutral';
                  let maxScore = 0;
                  
                  Object.entries(expressions).forEach(([emotion, score]) => {
                    if (score > maxScore) {
                      maxScore = score;
                      strongestEmotion = emotion;
                    }
                  });
                  
                  // Update status
                  status.textContent = `Status: Detected ${detections.length} faces. Emotion: ${strongestEmotion}`;
                  
                  // Draw detections
                  window.faceapi.draw.drawFaceLandmarks(canvas, detections);
                  window.faceapi.draw.drawFaceExpressions(canvas, detections);
                  
                  // Draw rectangles around detected faces
                  detections.forEach(detection => {
                    const box = detection.detection.box;
                    ctx.strokeStyle = '#4CAF50';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                  });
                } else {
                  status.textContent = 'Status: No faces detected';
                }
              }
            } catch (error) {
              console.error('Detection error:', error);
              status.textContent = `Status: Error: ${error.message}`;
            }
          }
        }, 100);
      } catch (error) {
        console.error('Camera access error:', error);
        status.textContent = `Status: Camera error: ${error.message}`;
      }
    }
    
    // Stop test function
    function stopTest() {
      // Stop detection interval
      if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
      }
      
      // Stop webcam stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      
      // Clear video
      video.srcObject = null;
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      status.textContent = 'Status: Stopped';
    }
  }
}); 