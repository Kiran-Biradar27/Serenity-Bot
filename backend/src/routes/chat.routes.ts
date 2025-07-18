import express from 'express';
import { 
  sendMessage, 
  getChats, 
  getChatById, 
  getMoodAnalysis,
  getVoiceToneAnalysis,
  getFacialEmotionAnalysis,
  getCombinedEmotionAnalysis,
  analyzeCognitiveDistortionController,
  generateReframedThoughtController,
  deleteChat
} from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes for chat functionality
router.post('/message', sendMessage);
router.get('/', getChats);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

// Routes for emotional analysis
router.post('/analyze-mood', getMoodAnalysis);
router.post('/analyze-voice', getVoiceToneAnalysis);
router.post('/analyze-face', getFacialEmotionAnalysis);
router.post('/analyze-emotion', getCombinedEmotionAnalysis);

// Routes for thought reframing
router.post('/analyze-thought', analyzeCognitiveDistortionController);
router.post('/reframe-thought', generateReframedThoughtController);

export default router; 