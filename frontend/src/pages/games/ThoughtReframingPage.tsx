import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Check as CheckIcon,
  Autorenew as AutorenewIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout';
import { AuthContext } from '../../context/AuthContext';

// API URL
const API_URL = 'http://localhost:5000/api';

// Cognitive distortions examples
const cognitiveDistortions = [
  {
    name: "Black and White Thinking",
    description: "Seeing things in absolute, all-or-nothing categories.",
    example: "If I'm not perfect, I'm a complete failure."
  },
  {
    name: "Catastrophizing",
    description: "Expecting the worst possible outcome.",
    example: "If I make a mistake in my presentation, my career is over."
  },
  {
    name: "Mind Reading",
    description: "Assuming you know what others are thinking without evidence.",
    example: "Everyone at the party thinks I'm boring."
  },
  {
    name: "Emotional Reasoning",
    description: "Assuming your feelings reflect reality.",
    example: "I feel incompetent, so I must be incompetent."
  }
];

const ThoughtReframingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [negativeThought, setNegativeThought] = useState('');
  const [distortion, setDistortion] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [savedReframes, setSavedReframes] = useState<{negative: string, reframed: string, distortion: string}[]>([]);
  const [loading, setLoading] = useState<{analyze: boolean, reframe: boolean}>({analyze: false, reframe: false});
  const [error, setError] = useState<string | null>(null);

  // Configure axios with authentication token
  const configureAxios = () => {
    return {
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
      },
    };
  };
  
  const handleAnalyzeDistortion = async () => {
    if (!negativeThought) return;
    
    setLoading({...loading, analyze: true});
    setError(null);
    
    try {
      const config = configureAxios();
      const response = await axios.post(
        `${API_URL}/chat/analyze-thought`, 
        { negativeThought },
        config
      );
      
      if (response.data && response.data.success) {
        setDistortion(response.data.data.distortion);
      } else {
        throw new Error(response.data?.message || 'Failed to analyze thought');
      }
    } catch (error: any) {
      console.error('Error analyzing thought:', error);
      setError(error.response?.data?.message || 'Failed to analyze cognitive distortion');
    } finally {
      setLoading({...loading, analyze: false});
    }
  };
  
  const handleGenerateReframe = async () => {
    if (!negativeThought) return;
    
    setLoading({...loading, reframe: true});
    setError(null);
    
    try {
      const config = configureAxios();
      const response = await axios.post(
        `${API_URL}/chat/reframe-thought`, 
        { 
          negativeThought, 
          distortion: distortion // If distortion is empty, the backend will analyze it first
        },
        config
      );
      
      if (response.data && response.data.success) {
        setDistortion(response.data.data.distortion); // Update distortion in case it was analyzed on the backend
        setReframedThought(response.data.data.reframedThought);
      } else {
        throw new Error(response.data?.message || 'Failed to generate reframed thought');
      }
    } catch (error: any) {
      console.error('Error generating reframed thought:', error);
      setError(error.response?.data?.message || 'Failed to generate reframed thought');
    } finally {
      setLoading({...loading, reframe: false});
    }
  };

  const handleSaveReframe = () => {
    if (negativeThought && reframedThought) {
      setSavedReframes([
        ...savedReframes,
        {
          negative: negativeThought,
          reframed: reframedThought,
          distortion: distortion
        }
      ]);
      setNegativeThought('');
      setDistortion('');
      setReframedThought('');
    }
  };

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/games')} 
          sx={{ mb: 2 }}
        >
          Back to Activities
        </Button>

        <Typography variant="h4" sx={{ mb: 1 }}>Thought Reframing</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Learn to identify negative thought patterns and reframe them in a more balanced way.
          This exercise is based on cognitive behavioral therapy techniques.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '60%' } }}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                Reframe a Negative Thought
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Negative Thought"
                  multiline
                  rows={2}
                  value={negativeThought}
                  onChange={(e) => setNegativeThought(e.target.value)}
                  fullWidth
                  placeholder="Write down a negative thought you've had recently..."
                />
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="What cognitive distortion might this be?"
                    value={distortion}
                    onChange={(e) => setDistortion(e.target.value)}
                    fullWidth
                    placeholder="e.g., Black and white thinking, catastrophizing, etc."
                    disabled={loading.analyze}
                  />
                  <Button 
                    variant="outlined"
                    onClick={handleAnalyzeDistortion}
                    disabled={!negativeThought || loading.analyze}
                    startIcon={loading.analyze ? <CircularProgress size={20} /> : <AutorenewIcon />}
                    sx={{ whiteSpace: 'nowrap', mt: 1 }}
                  >
                    {loading.analyze ? 'Analyzing...' : 'AI Analysis'}
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Reframed Thought"
                    multiline
                    rows={3}
                    value={reframedThought}
                    onChange={(e) => setReframedThought(e.target.value)}
                    fullWidth
                    placeholder="How could you reframe this thought in a more balanced way?"
                    disabled={loading.reframe}
                  />
                  <Button 
                    variant="outlined"
                    color="secondary"
                    onClick={handleGenerateReframe}
                    disabled={!negativeThought || loading.reframe}
                    startIcon={loading.reframe ? <CircularProgress size={20} /> : <AutorenewIcon />}
                    sx={{ whiteSpace: 'nowrap', mt: 1 }}
                  >
                    {loading.reframe ? 'Generating...' : 'AI Reframe'}
                  </Button>
                </Box>
                
                <Button 
                  variant="contained" 
                  onClick={handleSaveReframe}
                  disabled={!negativeThought || !reframedThought || loading.analyze || loading.reframe}
                  startIcon={<CheckIcon />}
                >
                  Save Reframe
                </Button>
              </Box>
            </Paper>
            
            {savedReframes.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Your Reframes</Typography>
                <List>
                  {savedReframes.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                        <ListItemText 
                          primary="Negative Thought:" 
                          secondary={item.negative}
                          primaryTypographyProps={{ color: 'error', fontWeight: 'bold', variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                        {item.distortion && (
                          <ListItemText 
                            primary="Cognitive Distortion:" 
                            secondary={item.distortion}
                            primaryTypographyProps={{ color: 'text.secondary', fontWeight: 'bold', variant: 'body2' }}
                            sx={{ mt: 1 }}
                          />
                        )}
                        <ListItemText 
                          primary="Reframed Thought:" 
                          secondary={item.reframed}
                          primaryTypographyProps={{ color: 'success.main', fontWeight: 'bold', variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'body1' }}
                          sx={{ mt: 1 }}
                        />
                      </ListItem>
                      {index < savedReframes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
          
          <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '40%' } }}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Common Cognitive Distortions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These are common patterns of negative thinking that can contribute to anxiety and depression.
                Learning to identify them is the first step toward changing them.
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper' }}>
                {cognitiveDistortions.map((distortion, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', py: 2 }}>
                      <ListItemText
                        primary={distortion.name}
                        secondary={distortion.description}
                        primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                      />
                      <Box sx={{ 
                        bgcolor: 'background.default', 
                        p: 1.5, 
                        borderRadius: 1, 
                        mt: 1,
                        width: '100%'
                      }}>
                        <Typography variant="body2" fontStyle="italic" color="text.secondary">
                          Example: "{distortion.example}"
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < cognitiveDistortions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
        
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </SharedLayout>
  );
};

export default ThoughtReframingPage; 