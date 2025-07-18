# Face-API.js Models

This directory contains machine learning models used by face-api.js for facial recognition and emotion detection in the SerenityBot application.

## Models Overview

The following models are required for the application:

1. **tiny_face_detector** - A lightweight face detection model
2. **face_landmark_68** - For detecting 68 facial landmarks
3. **face_expression** - For detecting facial expressions/emotions
4. **face_recognition** - For facial recognition features

## Directory Structure

Each model should have the following structure:
```
model_name/
  ├── model-weights_manifest.json - Describes the model structure
  └── model-shard1 - The actual model weights
```

## Loading Process

The application loads these models using the following process:

1. The `models-loader.js` script attempts to load models from several possible locations
2. It first looks in `/models`, then `/frontend/public/models`, and finally `/public/models`
3. If local models fail to load, it falls back to loading from a CDN
4. The loading status is saved in `localStorage` for the application to check

## Troubleshooting

If you encounter issues with facial emotion detection:

1. Check that all four models are present in the models directory
2. Open your browser console to see if there are any model loading errors
3. Try running the models-check.js script to verify model availability
4. Clear your browser cache and reload the page

## Adding or Updating Models

To update models, simply replace the files in the respective model directories. The application will use the new models on the next page load.

## Credits

These models are part of the face-api.js project. For more information, visit:
https://github.com/justadudewhohacks/face-api.js 