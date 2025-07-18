import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip
} from '@mui/material';
import {
  Spa as SpaIcon,
  Favorite as FavoriteIcon,
  Create as CreateIcon,
  Visibility as VisibilityIcon,
  Psychology as PsychologyIcon,
  EmojiEmotions as EmotionIcon
} from '@mui/icons-material';
import SharedLayout from '../components/SharedLayout';

const games = [
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Guided breathing techniques to help reduce anxiety and promote relaxation.',
    icon: <SpaIcon />,
    color: '#e3f2fd',
    iconColor: '#1976d2',
    tags: ['Relaxation', 'Stress Relief', 'Quick'],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'affirmations',
    title: 'Positive Affirmations',
    description: 'Daily affirmations to boost your mood, self-esteem, and positive mindset.',
    icon: <FavoriteIcon />,
    color: '#ffebee',
    iconColor: '#e91e63',
    tags: ['Positivity', 'Self-Esteem', 'Daily Practice'],
    image: 'https://images.unsplash.com/photo-1486748719772-dac71e23eaa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    description: 'Practice gratitude by recording positive experiences and things you\'re thankful for.',
    icon: <CreateIcon />,
    color: '#e8f5e9',
    iconColor: '#4caf50',
    tags: ['Reflection', 'Positivity', 'Journaling'],
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Practice',
    description: 'Interactive exercises to help you stay present and reduce rumination.',
    icon: <VisibilityIcon />,
    color: '#fff8e1',
    iconColor: '#ffc107',
    tags: ['Focus', 'Present Moment', 'Awareness'],
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'mood-tracker',
    title: 'Mood Tracker',
    description: 'Track your emotions over time to identify patterns and improve self-awareness.',
    icon: <EmotionIcon />,
    color: '#e0f7fa',
    iconColor: '#00bcd4',
    tags: ['Tracking', 'Self-Awareness', 'Daily Check-in'],
    image: 'https://images.unsplash.com/photo-1476097297040-79e9e1603142?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'thought-reframing',
    title: 'Thought Reframing',
    description: 'Learn to identify negative thought patterns and reframe them in a more balanced way.',
    icon: <PsychologyIcon />,
    color: '#f3e5f5',
    iconColor: '#9c27b0',
    tags: ['CBT', 'Negative Thoughts', 'Perspective'],
    image: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  }
];

const GamesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Activities & Games</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Explore these interactive exercises designed to improve your mental wellbeing.
          Each activity focuses on different aspects of mental health and mindfulness.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {games.map((game) => (
            <Box 
              key={game.id} 
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                mb: 2
              }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  bgcolor: game.color
                }}
              >
                <CardActionArea onClick={() => handleGameSelect(game.id)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.image}
                    alt={game.title}
                  />
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 1,
                      position: 'relative',
                      mt: -5,
                      ml: 2,
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      zIndex: 1
                    }}
                  >
                    <Box sx={{ color: game.iconColor, fontSize: '2rem' }}>
                      {game.icon}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div" fontWeight="600">
                      {game.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {game.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {game.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            '& .MuiChip-label': { fontWeight: 500 }
                          }} 
                        />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>

        <Paper sx={{ p: 3, mt: 4, borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>Why These Activities Help</Typography>
          <Typography variant="body2">
            Each of these exercises is based on proven therapeutic techniques used in mental health 
            treatment. Regular practice can help reduce stress, anxiety, and negative thought patterns,
            while promoting relaxation, mindfulness, and a positive outlook. Start with activities that 
            appeal to you the most, and try to incorporate them into your daily routine for best results.
          </Typography>
        </Paper>
      </Box>
    </SharedLayout>
  );
};

export default GamesPage; 