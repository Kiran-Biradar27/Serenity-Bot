import { Request, Response } from 'express';
import Chat from '../models/chat.model';
import { getChatResponse, analyzeMood, analyzeVoiceTone, analyzeFacialEmotion, combineEmotionalContext, analyzeCognitiveDistortion, generateReframedThought } from '../utils/gemini';
import { IMessage, EmotionalContext } from '../interfaces/chat.interface';

// @desc    Get chat response from Gemini
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, chatId, audioData, imageData, detectedEmotion } = req.body;
    const userId = req.user._id;

    // Check payload size first
    const payloadSize = JSON.stringify(req.body).length;
    console.log(`Received payload of size: ${(payloadSize / (1024 * 1024)).toFixed(2)}MB`);
    
    if (payloadSize > 45 * 1024 * 1024) { // 45MB threshold (slightly below the 50MB limit)
      return res.status(413).json({ 
        message: 'Payload too large. Please reduce the size of your message or media.' 
      });
    }

    let chat;
    
    // If chatId is provided, find existing chat
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: userId });
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      // Create a new chat if no chatId provided
      chat = await Chat.create({
        user: userId,
        messages: [],
        title: 'New Chat',
      });
    }

    // Process emotional context if available
    let emotionalContext: EmotionalContext | undefined = undefined;
    
    if (message) {
      emotionalContext = await combineEmotionalContext(
        message,
        audioData, // Optional audio data
        imageData, // Optional image data
        detectedEmotion // Optional detected emotion from face-api.js
      );
    }

    // Add user message to chat
    const userMessage: IMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      emotionalContext
    };
    
    chat.messages.push(userMessage);
    
    // Get response from Gemini
    const botResponse = await getChatResponse(chat.messages);
    
    // Add bot response to chat
    const botMessage: IMessage = {
      role: 'assistant',
      content: botResponse,
      timestamp: new Date(),
    };
    
    chat.messages.push(botMessage);
    
    // Update chat title if it's the first message
    if (chat.messages.length <= 2) {
      chat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
    }
    
    // Save updated chat
    await chat.save();

    // Structure the response to match frontend expectations
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error processing your message'
    });
  }
};

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your chats' 
    });
  }
};

// @desc    Get a single chat by ID
// @route   GET /api/chat/:id
// @access  Private
export const getChatById = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch chat details' 
    });
  }
};

// @desc    Analyze mood from text
// @route   POST /api/chat/analyze-mood
// @access  Private
export const getMoodAnalysis = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const mood = await analyzeMood(text);
    res.json({ mood });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Analyze voice tone from audio
// @route   POST /api/chat/analyze-voice
// @access  Private
export const getVoiceToneAnalysis = async (req: Request, res: Response) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ message: 'Audio data is required' });
    }
    
    const tone = await analyzeVoiceTone(audioData);
    res.json({ tone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Analyze facial emotion from image
// @route   POST /api/chat/analyze-face
// @access  Private
export const getFacialEmotionAnalysis = async (req: Request, res: Response) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }
    
    const emotion = await analyzeFacialEmotion(imageData);
    res.json({ emotion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get combined emotional analysis
// @route   POST /api/chat/analyze-emotion
// @access  Private
export const getCombinedEmotionAnalysis = async (req: Request, res: Response) => {
  try {
    const { text, audioData, imageData, detectedEmotion } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const emotionalContext = await combineEmotionalContext(text, audioData, imageData, detectedEmotion);
    res.json(emotionalContext);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Analyze cognitive distortion in a negative thought
// @route   POST /api/chat/analyze-thought
// @access  Private
export const analyzeCognitiveDistortionController = async (req: Request, res: Response) => {
  try {
    const { negativeThought } = req.body;
    
    if (!negativeThought) {
      return res.status(400).json({ 
        success: false, 
        message: 'Negative thought is required' 
      });
    }
    
    const distortion = await analyzeCognitiveDistortion(negativeThought);
    
    res.status(200).json({
      success: true,
      data: {
        negativeThought,
        distortion
      }
    });
  } catch (error) {
    console.error('Error analyzing cognitive distortion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to analyze cognitive distortion' 
    });
  }
};

// @desc    Generate a reframed positive thought
// @route   POST /api/chat/reframe-thought
// @access  Private
export const generateReframedThoughtController = async (req: Request, res: Response) => {
  try {
    const { negativeThought, distortion } = req.body;
    
    if (!negativeThought) {
      return res.status(400).json({ 
        success: false, 
        message: 'Negative thought is required' 
      });
    }
    
    // If distortion is not provided, analyze it first
    const cognitiveDistortion = distortion || await analyzeCognitiveDistortion(negativeThought);
    const reframedThought = await generateReframedThought(negativeThought, cognitiveDistortion);
    
    res.status(200).json({
      success: true,
      data: {
        negativeThought,
        distortion: cognitiveDistortion,
        reframedThought
      }
    });
  } catch (error) {
    console.error('Error generating reframed thought:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate reframed thought' 
    });
  }
};

// @desc    Delete a chat by ID
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found' 
      });
    }
    
    await Chat.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete chat' 
    });
  }
}; 