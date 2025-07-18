import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import SharedLayout from '../../components/SharedLayout';

interface GratitudeEntry {
  id: string;
  date: string;
  content: string;
  category: string;
}

const categories = [
  'People', 'Experiences', 'Things', 'Personal', 'Health', 'Work', 'Nature', 'Other'
];

const GratitudeJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GratitudeEntry[]>(() => {
    // Load entries from localStorage on initialization
    const savedEntries = localStorage.getItem('gratitudeEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [newEntry, setNewEntry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GratitudeEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gratitudeEntries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = () => {
    if (newEntry.trim() === '') return;

    const now = new Date();
    const newEntryObj: GratitudeEntry = {
      id: now.getTime().toString(),
      date: now.toISOString(),
      content: newEntry,
      category: selectedCategory
    };

    setEntries([newEntryObj, ...entries]);
    setNewEntry('');
    setSelectedCategory('Other');
    setOpenDialog(false);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || editingEntry.content.trim() === '') return;

    setEntries(entries.map(entry => 
      entry.id === editingEntry.id ? editingEntry : entry
    ));
    setEditingEntry(null);
    setOpenDialog(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEditEntry = (entry: GratitudeEntry) => {
    setEditingEntry(entry);
    setOpenDialog(true);
  };

  const handleOpenNewEntryDialog = () => {
    setEditingEntry(null);
    setNewEntry('');
    setSelectedCategory('Other');
    setOpenDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const filteredEntries = filterCategory 
    ? entries.filter(entry => entry.category === filterCategory)
    : entries;

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

        <Typography variant="h4" sx={{ mb: 1 }}>Gratitude Journal</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Practice gratitude daily by recording positive experiences and things you're thankful for.
          Regular gratitude practice has been shown to improve mental wellbeing and overall happiness.
        </Typography>

        {/* Category filter chips */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="All Entries" 
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
        </Box>

        {/* Entries list */}
        {filteredEntries.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredEntries.map(entry => (
              <Card 
                key={entry.id}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(entry.date)}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {entry.content}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={entry.category} 
                        color="primary" 
                        variant="outlined"
                        icon={<FavoriteIcon fontSize="small" />} 
                      />
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditEntry(entry)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteEntry(entry.id)}
                        aria-label="delete"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
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
              No Entries Yet
            </Typography>
            <Typography color="text.secondary">
              {filterCategory 
                ? `You haven't added any entries in the "${filterCategory}" category yet.` 
                : "Start by adding your first gratitude entry using the + button below."}
            </Typography>
          </Paper>
        )}

        {/* Floating action button for adding new entries */}
        <Fab 
          color="primary" 
          aria-label="add gratitude entry" 
          onClick={handleOpenNewEntryDialog}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Dialog for adding/editing entries */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingEntry ? "Edit Gratitude Entry" : "Add New Gratitude Entry"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                What are you grateful for today?
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="I'm grateful for..."
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={editingEntry ? editingEntry.content : newEntry}
                onChange={(e) => {
                  if (editingEntry) {
                    setEditingEntry({...editingEntry, content: e.target.value});
                  } else {
                    setNewEntry(e.target.value);
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
                      if (editingEntry) {
                        setEditingEntry({...editingEntry, category});
                      } else {
                        setSelectedCategory(category);
                      }
                    }}
                    color={(editingEntry ? editingEntry.category : selectedCategory) === category ? "primary" : "default"}
                    variant={(editingEntry ? editingEntry.category : selectedCategory) === category ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
              variant="contained"
              disabled={(editingEntry ? editingEntry.content : newEntry).trim() === ''}
            >
              {editingEntry ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SharedLayout>
  );
};

export default GratitudeJournalPage; 