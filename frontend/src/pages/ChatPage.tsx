import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  List, 
  ListItem,
  ListItemButton,
  Avatar,
  Divider,
  CircularProgress,
  Button,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import SharedLayout from '../components/SharedLayout';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

// Add TypeScript declaration for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
}

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [speechToText, setSpeechToText] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    sendMessage, 
    fetchChats, 
    fetchChatById, 
    setCurrentChat,
    isRecording,
    startRecording,
    stopRecording,
    deleteChat
  } = useContext(ChatContext);

  // Scroll to bottom of messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Speech recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Browser supports speech recognition
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          
          if (transcript) {
            setSpeechToText(prev => prev + ' ' + transcript);
            setMessage(prev => prev + ' ' + transcript);
          }
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const handleMicToggle = async () => {
    if (isRecording) {
      // Stop recording
      const audioData = await stopRecording();
      
      // We have audio data now as base64 string
      if (audioData) {
        // Voice analysis would happen in sendMessage automatically
        console.log("Audio recording completed");
      }
    } else {
      // Start recording
      await startRecording();
      
      // Start speech recognition if available
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Speech recognition error:", e);
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    try {
      // Store the message locally first for immediate feedback
      const pendingMessage = {
        content: message,
        role: 'user' as const,
        timestamp: new Date()
      };
      
      // Reset the input field immediately for better UX
      const messageCopy = message;
      setMessage('');
      setSpeechToText('');
      
      // Stop any ongoing recording
      let audioData = '';
      if (isRecording) {
        audioData = await stopRecording();
        
        // Stop speech recognition if active
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {
            console.error("Speech recognition error:", e);
          }
        }
      }
      
      // Add user message to UI immediately for better UX
      if (currentChat) {
        // No need to manually set loading state
        // The ChatContext will handle the loading state internally
      }
      
      // Estimate payload size to avoid 413 errors
      let estimatedPayloadSize = messageCopy.length;
      if (audioData) {
        estimatedPayloadSize += audioData.length;
      }
      
      // Large payload warning/handling (8MB is a safer limit)
      if (estimatedPayloadSize > 8 * 1024 * 1024) {
        // Show warning and send without media
        console.warn("Large payload detected, sending without audio");
        alert("Warning: Media content is too large. Sending text only.");
        await sendMessage(
          messageCopy,
          undefined,
          undefined,
          currentChat?._id
        );
      } else {
        // Send message with audio data
        await sendMessage(
          messageCopy, 
          audioData || undefined, 
          undefined,
          currentChat?._id
        );
        
        // Log for debugging
        console.log({
          messageSent: messageCopy,
          hasAudio: !!audioData,
          chatId: currentChat?._id,
          audioSize: audioData ? (audioData.length / 1024).toFixed(2) + "KB" : "none"
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Restore the message in the input field if it failed
      setMessage(message);
      
      // Extract the most useful error message
      let errorMessage = "Failed to send message.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show more specific errors based on response status
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = "Message too large. Please reduce audio length or try without audio.";
        } else if (error.response.status === 401) {
          errorMessage = "You need to log in again. Your session has expired.";
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleNewChat = () => {
    setCurrentChat(null);
  };

  const handleSelectChat = (chatId: string) => {
    fetchChatById(chatId);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId);
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };
  
  return (
    <SharedLayout>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        {/* Chat List Sidebar */}
        {showSidebar && (
          <Paper
            elevation={0}
            sx={{
              width: 280,
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider',
              display: 'block',
              position: { xs: 'absolute', md: 'relative' },
              zIndex: { xs: 10, md: 1 },
              backgroundColor: 'white',
              overflow: 'auto'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="600">
                Your Chats
              </Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                size="small" 
                onClick={handleNewChat}
              >
                New Chat
              </Button>
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {chats && chats.length > 0 ? (
                chats.map((chat) => (
                  <ListItem 
                    key={chat._id} 
                    disablePadding 
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => handleDeleteChat(e, chat._id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleSelectChat(chat._id)}
                      selected={currentChat?._id === chat._id}
                      sx={{
                        p: 2,
                        pr: 7, // Make room for delete button
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(106, 140, 175, 0.12)',
                        },
                      }}
                    >
                      <BotIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body1" noWrap>
                          {chat.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No chats yet
                  </Typography>
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Chat Box */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#f5f7fa',
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            ml: { xs: showSidebar ? '280px' : 0, md: 0 }, // Add margin on mobile when sidebar is visible
            transition: 'margin-left 0.3s ease' // Smooth transition
          }}
        >
          {/* Chat Header */}
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'white', 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <IconButton 
              sx={{ display: 'inline-flex', mr: 1 }}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
            <BotIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              {currentChat ? currentChat.title : 'New Conversation'}
            </Typography>
          </Box>

          {/* Messages Area */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            p: 2,
            maxHeight: 'calc(100% - 128px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {error && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Paper>
            )}

            <Box sx={{ flexGrow: 1 }}>
              {currentChat && currentChat.messages.length > 0 ? (
                currentChat.messages.map((msg, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                      maxWidth: '100%'
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main', flexShrink: 0 }}>
                        <BotIcon />
                      </Avatar>
                    )}
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        maxWidth: '70%', 
                        borderRadius: 2,
                        backgroundColor: msg.role === 'user' ? 'primary.light' : 'white',
                        wordBreak: 'break-word'
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      
                      {/* Show emotional context if available */}
                      {msg.emotionalContext && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {msg.emotionalContext.voiceTone && (
                            <Chip size="small" label={`Voice: ${msg.emotionalContext.voiceTone}`} />
                          )}
                          {msg.emotionalContext.textSentiment && (
                            <Chip size="small" label={`Text: ${msg.emotionalContext.textSentiment}`} />
                          )}
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Paper>
                    {msg.role === 'user' && (
                      <Avatar sx={{ ml: 1, bgcolor: 'secondary.main', flexShrink: 0 }}>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </Box>
                ))
              ) : !loading ? (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary'
                }}>
                  <BotIcon sx={{ fontSize: 60, mb: 2, color: 'primary.light' }} />
                  <Typography variant="h6">Start a conversation with SerenityBot</Typography>
                  <Typography variant="body2">Your mental health companion is here to help</Typography>
                </Box>
              ) : null}
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              )}
            </Box>
            
            <div ref={endOfMessagesRef} />
          </Box>
        </Box>

        {/* Message Input Area */}
        <Box 
          component="form"
          onSubmit={handleSendMessage}
          sx={{ 
            p: { xs: 1, sm: 2 }, 
            backgroundColor: 'white',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
              <IconButton 
                color={isRecording ? 'error' : 'default'}
                onClick={handleMicToggle}
                sx={{ flexShrink: 0, mr: 1 }}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            
            <TextField
              fullWidth
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              autoComplete="off"
              sx={{ 
                '.MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            
            <IconButton 
              color="primary" 
              type="submit"
              disabled={loading || message.trim() === ''}
              sx={{ flexShrink: 0, ml: 1 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
          
          {/* Speech-to-text result indicator */}
          {speechToText && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 1, fontStyle: 'italic' }}
            >
              Voice detected: "{speechToText.trim()}"
            </Typography>
          )}
        </Box>
      </Box>
    </SharedLayout>
  );
};

export default ChatPage; 