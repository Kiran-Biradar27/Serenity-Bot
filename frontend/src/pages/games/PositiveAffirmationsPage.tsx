import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Chip,
  Divider,
  Fade
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout';

interface Affirmation {
  id: string;
  text: string;
  category: string;
  isFavorite: boolean;
}

const categories = [
  'Self-Love', 'Success', 'Health', 'Confidence', 'Gratitude', 'Peace', 'Abundance', 'Custom'
];

// Default affirmations
const defaultAffirmations: Affirmation[] = [
  { id: '1', text: 'I am worthy of love and respect.', category: 'Self-Love', isFavorite: false },
  { id: '2', text: 'I believe in my abilities and potential.', category: 'Confidence', isFavorite: false },
  { id: '3', text: 'I am grateful for all the good in my life.', category: 'Gratitude', isFavorite: false },
  { id: '4', text: 'I am capable of achieving my goals.', category: 'Success', isFavorite: false },
  { id: '5', text: 'Every day I am getting better and stronger.', category: 'Health', isFavorite: false },
  { id: '6', text: 'I choose peace and positivity in all situations.', category: 'Peace', isFavorite: false },
  { id: '7', text: 'I attract abundance and prosperity.', category: 'Abundance', isFavorite: false },
  { id: '8', text: 'I am exactly where I need to be right now.', category: 'Peace', isFavorite: false },
  { id: '9', text: 'I trust the journey of my life.', category: 'Confidence', isFavorite: false },
  { id: '10', text: 'I radiate confidence, self-respect, and inner harmony.', category: 'Self-Love', isFavorite: false }
];

const PositiveAffirmationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [affirmations, setAffirmations] = useState<Affirmation[]>(() => {
    // Load affirmations from localStorage, or use defaults if none exist
    const savedAffirmations = localStorage.getItem('positiveAffirmations');
    return savedAffirmations ? JSON.parse(savedAffirmations) : defaultAffirmations;
  });
  
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Custom');
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Save affirmations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('positiveAffirmations', JSON.stringify(affirmations));
  }, [affirmations]);

  // Set random affirmation on load and when affirmations change
  useEffect(() => {
    if (affirmations.length > 0) {
      const filteredAffirmations = filterCategory === 'favorites' 
        ? affirmations.filter(a => a.isFavorite)
        : filterCategory 
          ? affirmations.filter(a => a.category === filterCategory)
          : affirmations;
      
      if (filteredAffirmations.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredAffirmations.length);
        setCurrentAffirmation(filteredAffirmations[randomIndex]);
      } else {
        setCurrentAffirmation(null);
      }
    } else {
      setCurrentAffirmation(null);
    }
  }, [affirmations, filterCategory]);

  const handleAddAffirmation = () => {
    if (newAffirmationText.trim() === '') return;
    
    const newAffirmation: Affirmation = {
      id: Date.now().toString(),
      text: newAffirmationText,
      category: selectedCategory,
      isFavorite: false
    };
    
    setAffirmations([...affirmations, newAffirmation]);
    setNewAffirmationText('');
    setSelectedCategory('Custom');
    setOpenDialog(false);
  };

  const handleUpdateAffirmation = () => {
    if (!editingAffirmation || editingAffirmation.text.trim() === '') return;
    
    setAffirmations(affirmations.map(affirmation => 
      affirmation.id === editingAffirmation.id ? editingAffirmation : affirmation
    ));
    setEditingAffirmation(null);
    setOpenDialog(false);
  };

  const handleDeleteAffirmation = (id: string) => {
    setAffirmations(affirmations.filter(affirmation => affirmation.id !== id));
  };

  const handleEditAffirmation = (affirmation: Affirmation) => {
    setEditingAffirmation(affirmation);
    setOpenDialog(true);
  };

  const handleOpenNewAffirmationDialog = () => {
    setEditingAffirmation(null);
    setNewAffirmationText('');
    setSelectedCategory('Custom');
    setOpenDialog(true);
  };

  const handleToggleFavorite = (id: string) => {
    setAffirmations(affirmations.map(affirmation => 
      affirmation.id === id 
        ? { ...affirmation, isFavorite: !affirmation.isFavorite } 
        : affirmation
    ));
  };

  const getRandomAffirmation = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const filteredAffirmations = filterCategory === 'favorites'
        ? affirmations.filter(a => a.isFavorite)
        : filterCategory 
          ? affirmations.filter(a => a.category === filterCategory)
          : affirmations;
      
      if (filteredAffirmations.length > 0) {
        let newAffirmation;
        // Try to get a different affirmation than the current one
        do {
          const randomIndex = Math.floor(Math.random() * filteredAffirmations.length);
          newAffirmation = filteredAffirmations[randomIndex];
        } while (
          filteredAffirmations.length > 1 && 
          newAffirmation && 
          currentAffirmation && 
          newAffirmation.id === currentAffirmation.id
        );
        
        setCurrentAffirmation(newAffirmation);
      }
      setIsShuffling(false);
    }, 300);
  };

  const filteredAffirmations = filterCategory === 'favorites'
    ? affirmations.filter(a => a.isFavorite)
    : filterCategory
      ? affirmations.filter(a => a.category === filterCategory) 
      : affirmations;

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', pb: 10 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/games')} 
          sx={{ mb: 2 }}
        >
          Back to Activities
        </Button>

        <Typography variant="h4" sx={{ mb: 1 }}>Positive Affirmations</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Affirmations are positive statements that can help you overcome negative thoughts,
          boost self-esteem, and cultivate a positive mindset. Repeat them daily for best results.
        </Typography>

        {/* Category filter chips */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="All" 
            onClick={() => setFilterCategory(null)}
            color={filterCategory === null ? "primary" : "default"}
            variant={filterCategory === null ? "filled" : "outlined"}
          />
          {categories.map(category => (
            <Chip 
              key={category}
              label={category} 
              onClick={() => setFilterCategory(category)}
              color={filterCategory === category ? "primary" : "default"}
              variant={filterCategory === category ? "filled" : "outlined"}
            />
          ))}
          <Chip 
            icon={<FavoriteIcon fontSize="small" />}
            label="Favorites" 
            onClick={() => setFilterCategory('favorites')}
            color={filterCategory === 'favorites' ? "primary" : "default"}
            variant={filterCategory === 'favorites' ? "filled" : "outlined"}
          />
        </Box>

        {/* Main affirmation display */}
        {filteredAffirmations.length > 0 ? (
          <Fade in={!isShuffling}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: 'center',
                mb: 4,
                bgcolor: '#f9f8ff',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {currentAffirmation && (
                <>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 500,
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      color: 'primary.main',
                      px: 2
                    }}
                  >
                    "{currentAffirmation.text}"
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      size="small" 
                      label={currentAffirmation.category} 
                      color="primary" 
                      variant="outlined" 
                    />
                    <IconButton
                      color={currentAffirmation.isFavorite ? "error" : "default"}
                      onClick={() => handleToggleFavorite(currentAffirmation.id)}
                      size="small"
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Box>
                  
                  <Button 
                    startIcon={<RefreshIcon />}
                    onClick={getRandomAffirmation}
                    variant="contained"
                    sx={{ mt: 3, alignSelf: 'center' }}
                  >
                    Show Another
                  </Button>
                </>
              )}
            </Paper>
          </Fade>
        ) : (
          <Paper
            elevation={1}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: 'rgba(0,0,0,0.02)'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Affirmations Found
            </Typography>
            <Typography color="text.secondary">
              {filterCategory 
                ? `You don't have any affirmations in the "${filterCategory}" category yet.` 
                : "Start by adding your first affirmation using the + button below."}
            </Typography>
          </Paper>
        )}

        {/* Affirmations list */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Your Affirmation Library
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredAffirmations.map(affirmation => (
            <Card 
              key={affirmation.id}
              sx={{ 
                borderRadius: 2,
                borderLeft: affirmation.isFavorite ? '4px solid' : '1px solid',
                borderColor: affirmation.isFavorite ? 'error.main' : 'divider'
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body1">
                    {affirmation.text}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleFavorite(affirmation.id)}
                      color={affirmation.isFavorite ? "error" : "default"}
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditAffirmation(affirmation)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteAffirmation(affirmation.id)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Chip 
                  size="small" 
                  label={affirmation.category} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Floating action button for adding new affirmations */}
        <Fab 
          color="primary" 
          aria-label="add affirmation" 
          onClick={handleOpenNewAffirmationDialog}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Dialog for adding/editing affirmations */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingAffirmation ? "Edit Affirmation" : "Add New Affirmation"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter a positive statement in the present tense
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="I am..."
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={editingAffirmation ? editingAffirmation.text : newAffirmationText}
                onChange={(e) => {
                  if (editingAffirmation) {
                    setEditingAffirmation({...editingAffirmation, text: e.target.value});
                  } else {
                    setNewAffirmationText(e.target.value);
                  }
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map(category => (
                  <Chip 
                    key={category}
                    label={category} 
                    onClick={() => {
                      if (editingAffirmation) {
                        setEditingAffirmation({...editingAffirmation, category});
                      } else {
                        setSelectedCategory(category);
                      }
                    }}
                    color={(editingAffirmation ? editingAffirmation.category : selectedCategory) === category ? "primary" : "default"}
                    variant={(editingAffirmation ? editingAffirmation.category : selectedCategory) === category ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={editingAffirmation ? handleUpdateAffirmation : handleAddAffirmation}
              variant="contained"
              disabled={(editingAffirmation ? editingAffirmation.text : newAffirmationText).trim() === ''}
            >
              {editingAffirmation ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tips section */}
        <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6">Tips for Effective Affirmations</Typography>
          <Divider sx={{ my: 1 }} />
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Use present tense as if the affirmation is already true (e.g., "I am" not "I will be").
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Be positive: focus on what you want, not what you don't want.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Make them personal and specific to your needs and goals.
            </Typography>
            <Typography component="li" variant="body2">
              Repeat your affirmations daily, ideally in front of a mirror, with conviction and emotion.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SharedLayout>
  );
};

export default PositiveAffirmationsPage; 