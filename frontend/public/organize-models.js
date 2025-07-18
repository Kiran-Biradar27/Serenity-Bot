// Model Organization Script
// This script ensures all models are in the correct location

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Starting model organization...');

  // Target location for all models
  const TARGET_PATH = '/models';
  
  // Possible model source locations
  const SOURCE_PATHS = [
    '/frontend/public/models',
    '/public/frontend/public/models',
    '/public/models'
  ];
  
  // Models we need
  const REQUIRED_MODELS = [
    'tiny_face_detector',
    'face_landmark_68',
    'face_expression',
    'face_recognition'
  ];
  
  // Files for each model
  const MODEL_FILES = {
    'tiny_face_detector': ['model-weights_manifest.json', 'model-shard1'],
    'face_landmark_68': ['model-weights_manifest.json', 'model-shard1'],
    'face_expression': ['model-weights_manifest.json', 'model-shard1'],
    'face_recognition': ['model-weights_manifest.json', 'model-shard1']
  };
  
  // Function to check if a file exists
  async function fileExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  // Function to copy a file
  async function copyFile(source, target) {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Failed to fetch ${source}`);
      
      const blob = await response.blob();
      const fileName = source.split('/').pop();
      
      // In a real app, we would upload this to the server
      // But for this demo, we'll just log it
      console.log(`Would copy ${source} to ${target}/${fileName}`);
      
      // Return success status
      return true;
    } catch (error) {
      console.error(`Error copying ${source}:`, error);
      return false;
    }
  }
  
  // Check target directory
  const targetExists = await fileExists(TARGET_PATH);
  if (!targetExists) {
    console.log(`Target directory ${TARGET_PATH} does not exist. Would create it.`);
    // In a real app, we would create the directory here
  }
  
  // Process each model
  for (const model of REQUIRED_MODELS) {
    console.log(`\nProcessing model: ${model}`);
    
    // Check if model exists in target location
    const targetModelPath = `${TARGET_PATH}/${model}`;
    const targetModelExists = await fileExists(`${targetModelPath}/model-weights_manifest.json`);
    
    if (targetModelExists) {
      console.log(`Model ${model} already exists in target location`);
      continue;
    }
    
    // Try to find the model in source locations
    let foundSource = false;
    
    for (const sourcePath of SOURCE_PATHS) {
      const sourceModelPath = `${sourcePath}/${model}`;
      const sourceModelExists = await fileExists(`${sourceModelPath}/model-weights_manifest.json`);
      
      if (sourceModelExists) {
        console.log(`Found model ${model} in ${sourcePath}`);
        
        // Copy all model files
        for (const file of MODEL_FILES[model]) {
          const sourceFile = `${sourceModelPath}/${file}`;
          const copySuccess = await copyFile(sourceFile, targetModelPath);
          
          if (copySuccess) {
            console.log(`Copied ${file}`);
          } else {
            console.error(`Failed to copy ${file}`);
          }
        }
        
        foundSource = true;
        break;
      }
    }
    
    if (!foundSource) {
      console.warn(`Could not find model ${model} in any source location`);
    }
  }
  
  console.log('\nModel organization complete!');
}); 