import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Slider,
  CircularProgress as MuiCircularProgress,
  IconButton,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

interface BreathingPattern {
  name: string;
  description: string;
  inhaleTime: number;
  hold1Time: number;
  exhaleTime: number;
  hold2Time: number;
  color: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: 'Box Breathing',
    description: 'Equal parts inhale, hold, exhale, and hold. Good for stress reduction and focus.',
    inhaleTime: 4,
    hold1Time: 4,
    exhaleTime: 4,
    hold2Time: 4,
    color: '#e3f2fd',
  },
  {
    name: '4-7-8 Breathing',
    description: 'Calming breath pattern that helps reduce anxiety and aids in falling asleep.',
    inhaleTime: 4,
    hold1Time: 7,
    exhaleTime: 8,
    hold2Time: 0,
    color: '#e8f5e9',
  },
  {
    name: 'Calm Breath',
    description: 'Simple technique for everyday relaxation and stress relief.',
    inhaleTime: 4,
    hold1Time: 2,
    exhaleTime: 6,
    hold2Time: 0,
    color: '#fff8e1',
  }
];

// Custom CircularProgress component with a prominent countdown number
const CircularProgress = ({ value, size = 120, thickness = 5, children }: { 
  value: number; 
  size?: number; 
  thickness?: number; 
  children?: React.ReactNode; 
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <MuiCircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{ color: 'primary.main' }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const BreathingExercisePage: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate total time for one complete cycle
    const total = selectedPattern.inhaleTime + selectedPattern.hold1Time + 
                  selectedPattern.exhaleTime + selectedPattern.hold2Time;
    setTotalTime(total);
    
    // Reset animation when pattern changes
    if (isPlaying) {
      stopAnimation();
      startAnimation();
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPattern]);

  // Animation loop
  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Update elapsed time
    const newElapsedTime = elapsedTime + deltaTime / 1000;
    setElapsedTime(newElapsedTime);

    // Calculate cycles
    const newTotalCycles = Math.floor(newElapsedTime / totalTime);
    if (newTotalCycles !== totalCycles) {
      setTotalCycles(newTotalCycles);
      setCurrentCycle(newTotalCycles + 1);
    }

    // Calculate current phase
    let timeInCycle = newElapsedTime % totalTime;
    let newPhase: BreathingPhase = 'idle';
    let phaseProgress = 0;
    let phaseTimeLeft = 0;
    let totalPhaseTime = 0;

    if (timeInCycle < selectedPattern.inhaleTime) {
      newPhase = 'inhale';
      totalPhaseTime = selectedPattern.inhaleTime;
      phaseProgress = timeInCycle / totalPhaseTime;
      phaseTimeLeft = totalPhaseTime - timeInCycle;
    } else {
      timeInCycle -= selectedPattern.inhaleTime;
      if (timeInCycle < selectedPattern.hold1Time) {
        newPhase = 'hold1';
        totalPhaseTime = selectedPattern.hold1Time;
        phaseProgress = timeInCycle / totalPhaseTime;
        phaseTimeLeft = totalPhaseTime - timeInCycle;
      } else {
        timeInCycle -= selectedPattern.hold1Time;
        if (timeInCycle < selectedPattern.exhaleTime) {
          newPhase = 'exhale';
          totalPhaseTime = selectedPattern.exhaleTime;
          phaseProgress = timeInCycle / totalPhaseTime;
          phaseTimeLeft = totalPhaseTime - timeInCycle;
        } else {
          timeInCycle -= selectedPattern.exhaleTime;
          newPhase = 'hold2';
          totalPhaseTime = selectedPattern.hold2Time;
          phaseProgress = timeInCycle / totalPhaseTime;
          phaseTimeLeft = totalPhaseTime - timeInCycle;
        }
      }
    }

    setCurrentPhase(newPhase);
    setProgress(phaseProgress * 100);
    setSecondsLeft(Math.ceil(phaseTimeLeft));

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    setIsPlaying(true);
    lastTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const resetAnimation = () => {
    stopAnimation();
    setElapsedTime(0);
    setCurrentPhase('idle');
    setProgress(0);
    setTotalCycles(0);
    setCurrentCycle(0);
    setSecondsLeft(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  const getInstructionText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale slowly through your nose';
      case 'hold1':
        return 'Hold your breath';
      case 'exhale':
        return 'Exhale slowly through your mouth';
      case 'hold2':
        return 'Hold before breathing in';
      default:
        return 'Press play to start';
    }
  };

  const getPhaseTimeTotal = () => {
    switch (currentPhase) {
      case 'inhale':
        return selectedPattern.inhaleTime;
      case 'hold1':
        return selectedPattern.hold1Time;
      case 'exhale':
        return selectedPattern.exhaleTime;
      case 'hold2':
        return selectedPattern.hold2Time;
      default:
        return 0;
    }
  };

  const getCircleSize = () => {
    if (currentPhase === 'inhale') {
      return 100 + progress * 1.5;
    } else if (currentPhase === 'exhale') {
      return 250 - progress * 1.5;
    }
    return currentPhase === 'idle' ? 100 : 250;
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'primary.main';
      case 'hold1':
        return 'success.main';
      case 'exhale':
        return 'secondary.main';
      case 'hold2':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

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

        <Typography variant="h4" sx={{ mb: 1 }}>Breathing Exercises</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Controlled breathing helps reduce stress and anxiety by activating your parasympathetic nervous system.
          Choose a pattern below and follow along with the animation.
        </Typography>

        {/* Pattern Selection */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {breathingPatterns.map((pattern) => (
            <Card 
              key={pattern.name}
              sx={{ 
                flex: '1 1 250px',
                cursor: 'pointer',
                bgcolor: pattern.name === selectedPattern.name ? pattern.color : 'background.paper',
                border: pattern.name === selectedPattern.name ? '2px solid' : '1px solid',
                borderColor: pattern.name === selectedPattern.name ? 'primary.main' : 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }
              }}
              onClick={() => setSelectedPattern(pattern)}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600">{pattern.name}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{pattern.description}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, color: 'text.secondary' }}>
                  <Typography variant="caption">Inhale: {pattern.inhaleTime}s</Typography>
                  {pattern.hold1Time > 0 && <Typography variant="caption">• Hold: {pattern.hold1Time}s</Typography>}
                  <Typography variant="caption">• Exhale: {pattern.exhaleTime}s</Typography>
                  {pattern.hold2Time > 0 && <Typography variant="caption">• Hold: {pattern.hold2Time}s</Typography>}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Breathing Animation */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: selectedPattern.color,
            textAlign: 'center',
            position: 'relative',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying && (
            <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Typography variant="body2" color="text.secondary">
                Cycle: {currentCycle}
              </Typography>
            </Box>
          )}
          
          <Box
            sx={{
              width: `${getCircleSize()}px`,
              height: `${getCircleSize()}px`,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.2,
              transition: currentPhase === 'hold1' || currentPhase === 'hold2' ? 'none' : 'all 0.1s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              position: 'relative',
            }}
          >
            {isPlaying && (
              <Box sx={{ position: 'absolute', zIndex: 2 }}>
                <CircularProgress 
                  value={(1 - secondsLeft / getPhaseTimeTotal()) * 100} 
                  size={160} 
                  thickness={3}
                >
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '3.5rem',
                      color: getPhaseColor()
                    }}
                  >
                    {secondsLeft}
                  </Typography>
                </CircularProgress>
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="h5" 
            color={getPhaseColor()}
            sx={{ 
              fontWeight: 'bold',
              mb: 3
            }}
          >
            {getInstructionText()}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <IconButton 
              onClick={togglePlayPause} 
              color="primary" 
              size="large"
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton 
              onClick={resetAnimation} 
              color="primary" 
              size="large"
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <ReplayIcon />
            </IconButton>
          </Box>
          
          {isPlaying && (
            <Box sx={{ mt: 4, width: '100%', maxWidth: 320 }}>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                {currentPhase !== 'idle' && `${getInstructionText()} (${Math.ceil(secondsLeft)}s / ${getPhaseTimeTotal()}s)`}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress * 100} 
                sx={{ 
                  mt: 1, 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.5)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getPhaseColor()
                  }
                }} 
              />
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6">Breathing Tips</Typography>
          <Divider sx={{ my: 1 }} />
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Find a comfortable position, either sitting or lying down.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Breathe through your nose when inhaling, and through slightly pursed lips when exhaling.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Keep your shoulders relaxed and focus on diaphragmatic (belly) breathing rather than chest breathing.
            </Typography>
            <Typography component="li" variant="body2">
              Practice for at least 5 minutes daily for best results.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SharedLayout>
  );
};

export default BreathingExercisePage; 