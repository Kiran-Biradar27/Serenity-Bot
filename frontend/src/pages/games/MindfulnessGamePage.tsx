import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  IconButton,
  Fade,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ReplayIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  category: 'beginner' | 'intermediate' | 'advanced';
}

const mindfulnessExercises: Exercise[] = [
  {
    id: '1',
    title: 'Body Scan Meditation',
    description: 'A gradual scan through your body to release tension and increase awareness.',
    duration: 300, // 5 minutes in seconds
    instructions: [
      'Find a comfortable seated or lying position.',
      'Close your eyes and take a few deep breaths.',
      'Bring your attention to your feet, noticing any sensations.',
      'Slowly move your attention up through your legs, torso, arms, and head.',
      'Notice any areas of tension and try to release them with each exhale.',
      'If your mind wanders, gently bring it back to the body part you\'re focusing on.',
      'After scanning your entire body, take a moment to feel your body as a whole.',
      'Slowly open your eyes when you\'re ready to finish.'
    ],
    category: 'beginner'
  },
  {
    id: '2',
    title: 'Five Senses Exercise',
    description: 'A grounding exercise to connect with the present moment through your senses.',
    duration: 180, // 3 minutes in seconds
    instructions: [
      'Sit comfortably and take a few deep breaths.',
      'Notice 5 things you can see around you.',
      'Acknowledge 4 things you can touch or feel.',
      'Recognize 3 things you can hear.',
      'Identify 2 things you can smell (or would be able to smell).',
      'Note 1 thing you can taste.',
      'Take a moment to appreciate how this exercise has connected you to the present.',
      'Open your eyes and return to your day with renewed awareness.'
    ],
    category: 'beginner'
  },
  {
    id: '3',
    title: 'Mindful Breathing',
    description: 'Focus on your breath to anchor yourself in the present moment.',
    duration: 240, // 4 minutes in seconds
    instructions: [
      'Sit in a comfortable position with your back straight.',
      'Close your eyes or keep them softly focused on a point in front of you.',
      'Breathe naturally, without trying to control your breath.',
      'Notice the sensation of breathing - the rise and fall of your chest and belly.',
      'When your mind wanders, gently bring your attention back to your breath.',
      'Continue for the duration, allowing each breath to anchor you to the present.',
      'Gradually expand your awareness to your whole body.',
      'Take three deeper breaths before finishing the practice.'
    ],
    category: 'beginner'
  },
  {
    id: '4',
    title: 'Loving-Kindness Meditation',
    description: 'Cultivate feelings of goodwill and compassion toward yourself and others.',
    duration: 360, // 6 minutes in seconds
    instructions: [
      'Sit comfortably and take a few deep breaths to settle in.',
      'Bring to mind someone you care deeply about and silently wish them well.',
      'Repeat phrases like "May you be happy. May you be healthy. May you be safe."',
      'Now direct these wishes toward yourself: "May I be happy. May I be healthy. May I be safe."',
      'Extend these wishes to someone you feel neutral about.',
      'If you feel ready, extend these wishes to someone you find difficult.',
      'Finally, extend these wishes to all beings everywhere.',
      'Take a few deep breaths and slowly open your eyes.'
    ],
    category: 'intermediate'
  },
  {
    id: '5',
    title: 'Walking Meditation',
    description: 'Practice mindfulness while walking to incorporate awareness into movement.',
    duration: 480, // 8 minutes in seconds
    instructions: [
      'Find a quiet space where you can walk 10-20 steps in one direction.',
      'Stand still and become aware of your body and the sensations in your feet.',
      'Begin walking slowly, paying attention to each step and the lifting and placing of your feet.',
      'Notice the shifting of your weight and the sensations in your legs and feet.',
      'When you reach the end of your path, pause, breathe, and turn around mindfully.',
      'Continue walking back and forth, maintaining awareness of your movements.',
      'If your mind wanders, gently return your attention to the physical sensations of walking.',
      'After completing the practice, stand still and notice how your body feels.'
    ],
    category: 'intermediate'
  }
];

const MindfulnessGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for completion sound
  useEffect(() => {
    try {
      audioRef.current = new Audio('/meditation-bell.mp3');
      audioRef.current.volume = 0.5;
      // Test if the audio can be loaded
      audioRef.current.addEventListener('error', () => {
        console.log('Error loading meditation bell sound');
        audioRef.current = null;
      });
    } catch (error) {
      console.log('Error initializing audio:', error);
      audioRef.current = null;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle timer logic
  useEffect(() => {
    if (isPlaying && selectedExercise) {
      if (timeRemaining <= 0) {
        handleExerciseComplete();
        return;
      }

      timerRef.current = setTimeout(() => {
        setTimeRemaining(prevTime => {
          // Update instruction every 30 seconds or based on remaining time
          const newTime = prevTime - 1;
          if (newTime > 0 && newTime % 30 === 0 || 
              (selectedExercise.instructions.length > currentInstructionIndex + 1 && 
               newTime === Math.floor(selectedExercise.duration / selectedExercise.instructions.length * (selectedExercise.instructions.length - currentInstructionIndex - 1)))) {
            setCurrentInstructionIndex(prev => 
              prev < selectedExercise.instructions.length - 1 ? prev + 1 : prev
            );
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining, selectedExercise, currentInstructionIndex]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setCurrentInstructionIndex(0);
    setIsPlaying(false);
  };

  const handleStartPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (selectedExercise) {
      setIsPlaying(false);
      setTimeRemaining(selectedExercise.duration);
      setCurrentInstructionIndex(0);
    }
  };

  const handleExerciseComplete = () => {
    setIsPlaying(false);
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.log('Audio play error:', e);
        // Show completion feedback even if audio fails
        alert('Exercise completed!');
      });
    } else if (!audioRef.current) {
      // Provide feedback when audio is not available
      alert('Exercise completed!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    if (!selectedExercise) return 0;
    return ((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100;
  };

  const filteredExercises = filterCategory 
    ? mindfulnessExercises.filter(ex => ex.category === filterCategory)
    : mindfulnessExercises;

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/games')} 
          sx={{ mb: 2 }}
        >
          Back to Activities
        </Button>

        <Typography variant="h4" sx={{ mb: 1 }}>Mindfulness Practice</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Mindfulness helps you focus on the present moment, reducing stress and anxiety.
          Choose a practice below and follow the guided instructions.
        </Typography>

        {/* Filter chips */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="All Exercises" 
            onClick={() => setFilterCategory(null)}
            color={filterCategory === null ? "primary" : "default"}
            variant={filterCategory === null ? "filled" : "outlined"}
          />
          <Chip 
            label="Beginner" 
            onClick={() => setFilterCategory('beginner')}
            color={filterCategory === 'beginner' ? "primary" : "default"}
            variant={filterCategory === 'beginner' ? "filled" : "outlined"}
          />
          <Chip 
            label="Intermediate" 
            onClick={() => setFilterCategory('intermediate')}
            color={filterCategory === 'intermediate' ? "primary" : "default"}
            variant={filterCategory === 'intermediate' ? "filled" : "outlined"}
          />
          <Chip 
            label="Advanced" 
            onClick={() => setFilterCategory('advanced')}
            color={filterCategory === 'advanced' ? "primary" : "default"}
            variant={filterCategory === 'advanced' ? "filled" : "outlined"}
          />
        </Box>

        {/* Active exercise display */}
        {selectedExercise && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              mb: 4,
              bgcolor: '#f2f7ff'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">{selectedExercise.title}</Typography>
              <Box>
                <IconButton 
                  onClick={() => setIsMuted(!isMuted)} 
                  size="small"
                  sx={{ mr: 1 }}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <IconButton 
                  onClick={handleReset} 
                  size="small"
                  disabled={!selectedExercise}
                >
                  <ReplayIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                {formatTime(timeRemaining)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                sx={{ height: 8, borderRadius: 4, mb: 2 }} 
              />
              <Button
                variant="contained"
                size="large"
                startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                onClick={handleStartPause}
                sx={{ px: 4 }}
              >
                {isPlaying ? 'Pause' : timeRemaining === selectedExercise.duration ? 'Start' : 'Resume'}
              </Button>
            </Box>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'white' }}>
              <Typography variant="subtitle1" gutterBottom>Current Instruction:</Typography>
              <Fade in={true} key={currentInstructionIndex}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {selectedExercise.instructions[currentInstructionIndex]}
                </Typography>
              </Fade>
              <Divider sx={{ my: 2 }} />
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {selectedExercise.instructions.map((instruction, index) => (
                  <Typography 
                    component="li" 
                    variant="body2" 
                    key={index}
                    sx={{ 
                      mb: 1, 
                      color: index === currentInstructionIndex ? 'primary.main' : 'text.secondary',
                      fontWeight: index === currentInstructionIndex ? 600 : 400
                    }}
                  >
                    {instruction}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Paper>
        )}

        {/* Exercise selection */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select a Mindfulness Exercise
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {filteredExercises.map((exercise) => (
            <Card 
              key={exercise.id}
              onClick={() => handleSelectExercise(exercise)}
              sx={{ 
                borderRadius: 2,
                cursor: 'pointer',
                borderLeft: selectedExercise?.id === exercise.id ? '4px solid' : '1px solid',
                borderColor: selectedExercise?.id === exercise.id ? 'primary.main' : 'divider',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {exercise.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {exercise.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        size="small" 
                        label={`${Math.floor(exercise.duration / 60)} min`} 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        size="small" 
                        label={exercise.category} 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  {selectedExercise?.id === exercise.id && (
                    <Chip 
                      label="Selected" 
                      color="primary" 
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Tips section */}
        <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Typography variant="h6">Mindfulness Tips</Typography>
          <Divider sx={{ my: 1 }} />
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Find a quiet space where you won't be disturbed during your practice.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              There\'s no "right way" to practice mindfulness—simply observe thoughts without judgment.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              If your mind wanders (which is normal), gently bring your attention back to the present.
            </Typography>
            <Typography component="li" variant="body2">
              Consistency is key—even a few minutes of daily practice can have significant benefits.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SharedLayout>
  );
};

export default MindfulnessGamePage; 