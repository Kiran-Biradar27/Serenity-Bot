import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar
} from '@mui/material';
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  SportsEsports as GamesIcon,
  Spa as SpaIcon,
  Favorite as FavoriteIcon,
  EmojiEmotions as EmotionIcon
} from '@mui/icons-material';
import SharedLayout from '../components/SharedLayout';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const featureCards = [
    {
      title: 'Chat with Serenity',
      description: 'Have natural conversations with SerenityBot, your personal mental health companion.',
      icon: <ChatIcon fontSize="large" color="primary" />,
      onClick: () => navigate('/chat'),
      color: '#e3f2fd'
    },
    {
      title: 'Community Support',
      description: 'Share your thoughts anonymously and connect with a supportive community.',
      icon: <GroupIcon fontSize="large" color="primary" />,
      onClick: () => navigate('/community'),
      color: '#e8f5e9'
    },
    {
      title: 'Activities & Games',
      description: 'Explore interactive exercises and games to help manage stress and anxiety.',
      icon: <GamesIcon fontSize="large" color="primary" />,
      onClick: () => navigate('/games'),
      color: '#fff8e1'
    }
  ];

  const moodGames = [
    {
      title: 'Breathing Exercises',
      description: 'Guided breathing techniques for relaxation and stress reduction.',
      icon: <SpaIcon fontSize="medium" />,
      onClick: () => navigate('/games/breathing')
    },
    {
      title: 'Positive Affirmations',
      description: 'Daily affirmations to boost your mood and confidence.',
      icon: <FavoriteIcon fontSize="medium" />,
      onClick: () => navigate('/games/affirmations')
    },
    {
      title: 'Mood Tracker',
      description: 'Track your emotional wellbeing over time.',
      icon: <EmotionIcon fontSize="medium" />,
      onClick: () => navigate('/games/mood-tracker')
    }
  ];

  return (
    <SharedLayout>
      <Box sx={{ mb: 4, position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(to right, #9ec3b5, #6a8caf)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Welcome Content */}
          <Box sx={{ maxWidth: { xs: '100%', md: '70%' } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome, {user?.username}!
            </Typography>
            <Box 
              component="img"
              src="https://readme-typing-svg.demolab.com/?font=Inter&size=22&pause=1000&color=FFFFFF&width=1000&lines=SerenityBot+is+your+24%2F7+mental+health+companion.+How+can+we+help+you+today%3F"
              alt="SerenityBot is your 24/7 mental health companion. How can we help you today?"
              sx={{
                maxWidth: '100%',
                height: '36px',
                mt: 1
              }}
            />
          </Box>

          {/* Tomodachi Kawaii Robot GIF - positioned inside welcome banner */}
          <Box
            sx={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: { xs: '80px', sm: '100px', md: '120px' },
              height: { xs: '80px', sm: '100px', md: '120px' },
              display: { xs: 'none', sm: 'block' },
              zIndex: 2
            }}
          >
            <img
              src="https://media1.tenor.com/m/mGCBllSlDMUAAAAd/tomodachi-kawaii.gif"
              alt="Tomodachi Robot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
          </Box>
        </Paper>

        {/* Main Features */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Main Features
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
          {featureCards.map((card) => (
            <Paper
              key={card.title}
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '1 1 calc(33.333% - 16px)',
                minWidth: 240,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                backgroundColor: card.color,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
              }}
              onClick={card.onClick}
            >
              <Box sx={{ mb: 2 }}>{card.icon}</Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                {card.title}
              </Typography>
              <Typography variant="body2" textAlign="center">
                {card.description}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Quick Activities */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Activities
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {moodGames.map((game) => (
            <Card 
              key={game.title}
              variant="outlined" 
              sx={{ 
                flex: '1 1 calc(33.333% - 16px)',
                minWidth: 240,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 1, bgcolor: 'primary.light' }}>
                    {game.icon}
                  </Avatar>
                  <Typography variant="h6">{game.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {game.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={game.onClick}>
                  Try Now
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
    </SharedLayout>
  );
};

export default Dashboard; 