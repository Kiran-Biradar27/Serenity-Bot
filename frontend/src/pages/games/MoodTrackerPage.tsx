import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Fab,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  ViewList as ListIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentSatisfied as ContentIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as SadIcon,
  SentimentVeryDissatisfied as AngryIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, sub, eachDayOfInterval } from 'date-fns';
import SharedLayout from '../../components/SharedLayout';

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5, where 1 is very sad and 5 is very happy
  activities: string[];
  notes: string;
}

// List of common activities
const activityOptions = [
  'Exercise', 'Work', 'Social', 'Family', 'Rest', 'Hobby', 'Nature',
  'Reading', 'TV/Movies', 'Shopping', 'Cooking', 'Cleaning', 'Travel',
  'Music', 'Gaming', 'Meditation', 'Therapy', 'Learning', 'Art', 'Other'
];

// Mood colors
const moodColors = [
  '#e57373', // red for very sad (1)
  '#ffb74d', // orange for sad (2)
  '#fff176', // yellow for neutral (3)
  '#aed581', // light green for good (4)
  '#4fc3f7'  // blue for very good (5)
];

// Mood icons
const MoodIcon = ({ value }: { value: number }) => {
  switch (value) {
    case 1: return <AngryIcon fontSize="large" />;
    case 2: return <SadIcon fontSize="large" />;
    case 3: return <NeutralIcon fontSize="large" />;
    case 4: return <ContentIcon fontSize="large" />;
    case 5: return <HappyIcon fontSize="large" />;
    default: return <NeutralIcon fontSize="large" />;
  }
};

const getMoodLabel = (value: number) => {
  switch (value) {
    case 1: return 'Very Bad';
    case 2: return 'Bad';
    case 3: return 'Neutral';
    case 4: return 'Good';
    case 5: return 'Very Good';
    default: return 'Neutral';
  }
};

const MoodTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<MoodEntry[]>(() => {
    // Load entries from localStorage on initialization
    const savedEntries = localStorage.getItem('moodEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = () => {
    if (selectedMood === 0) return;
    
    const newEntry: MoodEntry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      date: selectedDate.toISOString(),
      mood: selectedMood,
      activities: selectedActivities,
      notes: notes.trim()
    };
    
    if (editingEntry) {
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id ? newEntry : entry
      ));
      setEditingEntry(null);
    } else {
      setEntries([...entries, newEntry]);
    }
    
    resetForm();
    setOpenDialog(false);
  };

  const handleOpenNewEntryDialog = () => {
    resetForm();
    setEditingEntry(null);
    setOpenDialog(true);
  };

  const handleEditEntry = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setSelectedDate(new Date(entry.date));
    setSelectedMood(entry.mood);
    setSelectedActivities(entry.activities);
    setNotes(entry.notes);
    setOpenDialog(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedMood(3);
    setSelectedActivities([]);
    setNotes('');
  };

  const handleActivityToggle = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get last 7 days for calendar view
  const lastWeekDays = eachDayOfInterval({
    start: sub(new Date(), { days: 6 }),
    end: new Date()
  });

  // Function to get entry for a specific date
  const getEntryForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return entries.find(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === dateString
    );
  };

  // Calculate average mood if entries exist
  const averageMood = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length
    : 0;

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

        <Typography variant="h4" sx={{ mb: 1 }}>Mood Tracker</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Track your emotions and moods over time to identify patterns and improve self-awareness.
          Understanding your emotional patterns can help you make positive life changes.
        </Typography>

        {/* View mode toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ListIcon fontSize="small" sx={{ mr: 0.5 }} /> List
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} /> Calendar
            </ToggleButton>
            <ToggleButton value="timeline" aria-label="timeline view">
              <TimelineIcon fontSize="small" sx={{ mr: 0.5 }} /> Timeline
            </ToggleButton>
          </ToggleButtonGroup>

          {entries.length > 0 && (
            <Chip 
              icon={<MoodIcon value={Math.round(averageMood)} />}
              label={`Average mood: ${getMoodLabel(Math.round(averageMood))}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {sortedEntries.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedEntries.map(entry => (
                  <Card 
                    key={entry.id}
                    sx={{ 
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderColor: moodColors[entry.mood - 1],
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {formatDate(entry.date)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: moodColors[entry.mood - 1],
                              mr: 1
                            }}>
                              <MoodIcon value={entry.mood} />
                            </Box>
                            <Typography variant="h6">
                              {getMoodLabel(entry.mood)}
                            </Typography>
                          </Box>
                          
                          {entry.activities.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Activities:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {entry.activities.map(activity => (
                                  <Chip key={activity} label={activity} size="small" />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {entry.notes && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Notes:
                              </Typography>
                              <Typography variant="body2">
                                {entry.notes}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => handleEditEntry(entry)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteEntry(entry.id)} color="error">
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
                  No Mood Entries Yet
                </Typography>
                <Typography color="text.secondary">
                  Start tracking your moods by tapping the + button below
                </Typography>
              </Paper>
            )}
          </>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Last 7 Days</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {lastWeekDays.map((day: Date) => {
                const entry = getEntryForDate(day);
                return (
                  <Box key={day.toISOString()} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' }, p: 1 }}>
                    <Card 
                      sx={{ 
                        textAlign: 'center', 
                        bgcolor: entry ? `${moodColors[entry.mood - 1]}20` : 'background.paper',
                        borderRadius: 2,
                        height: '100%',
                        cursor: entry ? 'pointer' : 'default',
                        border: '1px solid',
                        borderColor: entry ? moodColors[entry.mood - 1] : 'divider',
                        '&:hover': entry ? { transform: 'scale(1.03)', boxShadow: 2 } : {},
                        transition: 'transform 0.2s'
                      }}
                      onClick={() => entry && handleEditEntry(entry)}
                    >
                      <CardContent>
                        <Typography variant="subtitle2">
                          {format(day, 'EEE')}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {format(day, 'd')}
                        </Typography>
                        {entry ? (
                          <Box sx={{ color: moodColors[entry.mood - 1], mt: 1 }}>
                            <MoodIcon value={entry.mood} />
                            <Typography variant="body2" fontWeight="medium">
                              {getMoodLabel(entry.mood)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No entry
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Mood Timeline</Typography>
            
            {entries.length > 0 ? (
              <Box sx={{ mt: 2, height: 200, position: 'relative' }}>
                {entries.length > 1 ? (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: '3px', 
                      bgcolor: 'divider',
                      position: 'relative',
                      zIndex: 1
                    }} />
                    
                    {sortedEntries.slice(0, 14).reverse().map((entry, index, array) => {
                      const position = (index / (array.length - 1)) * 100;
                      return (
                        <Tooltip 
                          key={entry.id}
                          title={`${formatDate(entry.date)}: ${getMoodLabel(entry.mood)}`}
                        >
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              left: `${position}%`, 
                              bottom: `${((entry.mood - 1) / 4) * 100}%`,
                              transform: 'translate(-50%, 50%)',
                              zIndex: 2,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              bgcolor: moodColors[entry.mood - 1],
                              border: '2px solid white',
                              boxShadow: 1
                            }} />
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
                    Add more entries to see a timeline
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 3 }}>
                No mood entries to display
              </Typography>
            )}
          </Paper>
        )}

        {/* Floating action button for adding new entry */}
        <Fab 
          color="primary" 
          aria-label="add mood entry" 
          onClick={handleOpenNewEntryDialog}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Dialog for adding/editing mood entries */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingEntry ? "Edit Mood Entry" : "Add New Mood Entry"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={(newDate: Date | null) => newDate && setSelectedDate(newDate)}
                  sx={{ width: '100%', mb: 3 }}
                />
              </LocalizationProvider>

              <Typography variant="subtitle1" gutterBottom>How are you feeling today?</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <AngryIcon fontSize="large" color={selectedMood === 1 ? "error" : "disabled"} />
                  <Typography variant="caption">Very Bad</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <SadIcon fontSize="large" color={selectedMood === 2 ? "warning" : "disabled"} />
                  <Typography variant="caption">Bad</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <NeutralIcon fontSize="large" color={selectedMood === 3 ? "info" : "disabled"} />
                  <Typography variant="caption">Neutral</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <ContentIcon fontSize="large" color={selectedMood === 4 ? "success" : "disabled"} />
                  <Typography variant="caption">Good</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <HappyIcon fontSize="large" color={selectedMood === 5 ? "primary" : "disabled"} />
                  <Typography variant="caption">Very Good</Typography>
                </Box>
              </Box>
              
              <Slider
                value={selectedMood}
                min={1}
                max={5}
                step={1}
                onChange={(_, value) => setSelectedMood(value as number)}
                marks
                sx={{ 
                  mb: 4,
                  '& .MuiSlider-mark': {
                    height: 8,
                    width: 8,
                    borderRadius: '50%'
                  },
                  '& .MuiSlider-track': {
                    background: `linear-gradient(to right, ${moodColors[0]}, ${moodColors[4]})`
                  }
                }}
              />

              <Typography variant="subtitle1" gutterBottom>Activities (optional)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {activityOptions.map(activity => (
                  <Chip 
                    key={activity}
                    label={activity}
                    onClick={() => handleActivityToggle(activity)}
                    color={selectedActivities.includes(activity) ? "primary" : "default"}
                    variant={selectedActivities.includes(activity) ? "filled" : "outlined"}
                  />
                ))}
              </Box>

              <TextField
                label="Notes (optional)"
                placeholder="How did you feel today? What might have influenced your mood?"
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddEntry} variant="contained">
              {editingEntry ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tips section */}
        <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6">Tips for Effective Mood Tracking</Typography>
          <Divider sx={{ my: 1 }} />
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Track your mood at the same time each day to establish a consistent baseline.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Notice patterns between your activities and mood changes to identify triggers.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Be honest with yourself—mood tracking is most effective when you record how you truly feel.
            </Typography>
            <Typography component="li" variant="body2">
              Share your insights with a mental health professional if you notice concerning patterns.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SharedLayout>
  );
};

export default MoodTrackerPage; 