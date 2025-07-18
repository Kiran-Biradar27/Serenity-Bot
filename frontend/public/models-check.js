// Face-API Models Check Script
// This script checks the availability of face-api.js models

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Checking face-api.js models...');

  // Model directories to check
  const modelDirectories = [
    '/models',
    '/frontend/public/models',
    '/public/models'
  ];

  // Expected model files for each model
  const expectedModels = {
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

  // Check all model paths
  async function checkModels() {
    console.log('Starting model check...');
    
    // Create a result object to store overall status
    const results = {
      directoriesChecked: 0,
      validDirectories: 0,
      completeModels: 0,
      missingModels: 0
    };
    
    for (const dir of modelDirectories) {
      console.log(`\nChecking directory: ${dir}`);
      results.directoriesChecked++;
      let validDirectory = false;
      
      for (const [model, files] of Object.entries(expectedModels)) {
        const modelPath = `${dir}/${model}`;
        console.log(`\n  Model: ${model}`);
        
        let allFilesExist = true;
        for (const file of files) {
          const fileUrl = `${modelPath}/${file}`;
          const exists = await fileExists(fileUrl);
          console.log(`    ${file}: ${exists ? '✅ Found' : '❌ Missing'}`);
          if (!exists) allFilesExist = false;
        }
        
        if (allFilesExist) {
          validDirectory = true;
          results.completeModels++;
          console.log(`  Status: ✅ Complete`);
        } else {
          results.missingModels++;
          console.log(`  Status: ❌ Incomplete`);
        }
      }
      
      if (validDirectory) {
        results.validDirectories++;
      }
    }
    
    console.log('\nModel check summary:');
    console.log(`- Directories checked: ${results.directoriesChecked}`);
    console.log(`- Valid directories found: ${results.validDirectories}`);
    console.log(`- Complete models found: ${results.completeModels}`);
    console.log(`- Missing/incomplete models: ${results.missingModels}`);
    
    console.log('\nModel check completed!');
    
    // Store results in localStorage for other scripts to use
    localStorage.setItem('faceApiModelCheckResults', JSON.stringify(results));
    
    return results;
  }

  // Only run in development mode
  const isDevMode = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
                   
  if (isDevMode) {
    // Wait a moment to ensure network is ready
    setTimeout(() => {
      checkModels();
    }, 1000);
  }
}); 