import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Context providers
import AuthProvider from './context/AuthContext';
import ChatProvider from './context/ChatContext';
import CommunityProvider from './context/CommunityContext';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import CommunityPage from './pages/CommunityPage';
import PostDetail from './pages/PostDetail';
import GamesPage from './pages/GamesPage';
import BreathingExercisePage from './pages/games/BreathingExercisePage';
import PositiveAffirmationsPage from './pages/games/PositiveAffirmationsPage';
import GratitudeJournalPage from './pages/games/GratitudeJournalPage';
import MindfulnessGamePage from './pages/games/MindfulnessGamePage';
import MoodTrackerPage from './pages/games/MoodTrackerPage';
import ThoughtReframingPage from './pages/games/ThoughtReframingPage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#6a8caf', // Calm blue
    },
    secondary: {
      main: '#9ec3b5', // Soothing green
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ChatProvider>
          <CommunityProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community" 
                  element={
                    <ProtectedRoute>
                      <CommunityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community/post/:id" 
                  element={
                    <ProtectedRoute>
                      <PostDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games" 
                  element={
                    <ProtectedRoute>
                      <GamesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/breathing" 
                  element={
                    <ProtectedRoute>
                      <BreathingExercisePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/affirmations" 
                  element={
                    <ProtectedRoute>
                      <PositiveAffirmationsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/gratitude" 
                  element={
                    <ProtectedRoute>
                      <GratitudeJournalPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/mindfulness" 
                  element={
                    <ProtectedRoute>
                      <MindfulnessGamePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/mood-tracker" 
                  element={
                    <ProtectedRoute>
                      <MoodTrackerPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/games/thought-reframing" 
                  element={
                    <ProtectedRoute>
                      <ThoughtReframingPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Router>
          </CommunityProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
