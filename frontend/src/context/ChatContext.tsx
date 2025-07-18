import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API_URL = 'http://localhost:5000/api';

interface EmotionalContext {
  voiceTone?: string;
  textSentiment?: string;
  combinedEmotionScore?: {
    happy?: number;
    sad?: number;
    angry?: number;
    anxious?: number;
    neutral?: number;
    stressed?: number;
    depressed?: number;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotionalContext?: EmotionalContext;
}

interface Chat {
  _id: string;
  user: string;
  messages: Message[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatProviderProps {
  children: ReactNode;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, audioData?: string, imageData?: string, chatId?: string) => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchChatById: (chatId: string) => Promise<void>;
  analyzeMood: (text: string) => Promise<string>;
  analyzeVoice: (audioData: string) => Promise<string>;
  setCurrentChat: (chat: Chat | null) => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType>({
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
  sendMessage: async () => {},
  fetchChats: async () => {},
  fetchChatById: async () => {},
  analyzeMood: async () => '',
  analyzeVoice: async () => '',
  setCurrentChat: () => {},
  isRecording: false,
  startRecording: async () => {},
  stopRecording: async () => '',
  deleteChat: async () => {}
});

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  
  // Media recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Configure axios with authentication token
  const configureAxios = () => {
    if (!user || !user.token) {
      console.error("No user token available for API request");
      setError("You need to be logged in to chat. Please log in again.");
      return {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    console.log("Using token for request:", user.token.substring(0, 15) + "...");
    return {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
    };
  };

  // Audio recording functions
  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // More aggressive audio settings for smaller file size
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', 
        audioBitsPerSecond: 8000 // Very low bitrate for smallest file size
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      // Set smaller chunks to improve compression
      recorder.start(1000); // Collect in 1-second chunks
      
      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Automatically stop recording after 30 seconds to limit payload size
      setTimeout(() => {
        if (recorder.state === 'recording') {
          console.log("Auto-stopping recording after 30 seconds");
          stopRecording();
        }
      }, 30000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone');
    }
  };
  
  const stopRecording = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        setIsRecording(false);
        reject('No recording in progress');
        return;
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log(`Raw audio size: ${(audioBlob.size / (1024 * 1024)).toFixed(2)}MB`);
        
        // Check if blob is too large (>3MB) and reject if it is
        if (audioBlob.size > 3 * 1024 * 1024) {
          setError('Audio recording is too large. Please keep recordings under 30 seconds.');
          setIsRecording(false);
          resolve(''); // Return empty string to indicate no valid audio
          return;
        }
        
        // Convert to smaller format if needed
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove prefix (data:audio/webm;base64,)
          const audioData = base64data.split(',')[1];
          
          console.log(`Audio base64 size: ${(audioData.length / (1024 * 1024)).toFixed(2)}MB`);
          setIsRecording(false);
          resolve(audioData);
        };
      };
      
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  };

  // Fetch all chats for the current user
  const fetchChats = async () => {
    try {
      setLoading(true);
      const config = configureAxios();
      const response = await axios.get(`${API_URL}/chat`, config);
      setChats(response.data.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.response?.data?.message || 'Failed to fetch chats');
      setLoading(false);
    }
  };

  // Fetch a specific chat by ID
  const fetchChatById = async (chatId: string) => {
    try {
      setLoading(true);
      const config = configureAxios();
      const response = await axios.get(`${API_URL}/chat/${chatId}`, config);
      setCurrentChat(response.data.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching chat:', err);
      setError(err.response?.data?.message || 'Failed to fetch chat');
      setLoading(false);
    }
  };

  // Delete a chat by ID
  const deleteChat = async (chatId: string) => {
    try {
      setLoading(true);
      const config = configureAxios();
      await axios.delete(`${API_URL}/chat/${chatId}`, config);
      
      // Update chats list after deletion
      setChats(chats.filter(chat => chat._id !== chatId));
      
      // Reset current chat if it was the deleted one
      if (currentChat && currentChat._id === chatId) {
        setCurrentChat(null);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error deleting chat:', err);
      setError(err.response?.data?.message || 'Failed to delete chat');
      setLoading(false);
    }
  };

  // Send a message to the AI assistant
  const sendMessage = async (message: string, audioData?: string, imageData?: string, chatId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        setError("You need to be logged in to send messages");
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const requestData: any = {
        message
      };
      
      // Only add these if they exist to reduce payload size
      if (audioData) requestData.audioData = audioData;
      if (imageData) requestData.imageData = imageData;
      if (chatId) requestData.chatId = chatId;
      
      console.log("Sending message to API", { 
        chatId, 
        messageLength: message.length,
        hasAudio: !!audioData,
        hasImage: !!imageData
      });
      
      // Send the message
      const url = `${API_URL}/chat/message`;
      const response = await axios.post(url, requestData, config);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      console.log("Message sent successfully:", response.data.data.title);
      setCurrentChat(response.data.data);
      
      // Refresh the chat list to update titles
      fetchChats();
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send message';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  // Analyze text sentiment
  const analyzeMood = async (text: string): Promise<string> => {
    try {
      const config = configureAxios();
      const response = await axios.post(
        `${API_URL}/chat/analyze-text`,
        { text },
        config
      );
      return response.data.sentiment;
    } catch (err: any) {
      console.error('Error analyzing text mood:', err);
      return 'neutral'; // Default fallback
    }
  };

  // Analyze voice tone
  const analyzeVoice = async (audioData: string): Promise<string> => {
    try {
      const config = configureAxios();
      const response = await axios.post(
        `${API_URL}/chat/analyze-voice`,
        { audioData },
        config
      );
      return response.data.tone;
    } catch (err: any) {
      console.error('Error analyzing voice tone:', err);
      return 'neutral'; // Default fallback
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loading,
        error,
        sendMessage,
        fetchChats,
        fetchChatById,
        analyzeMood,
        analyzeVoice,
        setCurrentChat,
        isRecording,
        startRecording,
        stopRecording,
        deleteChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Add default export
export default ChatProvider; 