import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon
} from '@mui/icons-material';
import SharedLayout from '../components/SharedLayout';
import { CommunityContext } from '../context/CommunityContext';
import { AuthContext } from '../context/AuthContext';

const CommunityPage: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { posts, loading, error, createPost, likePost, fetchPosts } = useContext(CommunityContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (postContent.trim() === '') return;
    
    await createPost(postContent, isAnonymous);
    setPostContent('');
  };

  const handleLikePost = async (postId: string) => {
    await likePost(postId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Helper function to safely get the author's initial
  const getAuthorInitial = (post: any) => {
    if (post.isAnonymous) return 'A';
    if (!post.author || !post.author.username) return '?';
    return post.author.username.charAt(0).toUpperCase();
  };

  // Helper function to safely get the author's username
  const getAuthorName = (post: any) => {
    if (post.isAnonymous) return 'Anonymous User';
    if (!post.author || !post.author.username) return 'Unknown User';
    return post.author.username;
  };

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Community Support</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Share your thoughts and experiences, or provide support to others. 
          You can remain anonymous if you prefer.
        </Typography>

        {/* Create post card */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Share Your Thoughts</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind today?"
            variant="outlined"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isAnonymous ? <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} /> : <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />}
                  <Typography variant="body2">Post anonymously</Typography>
                </Box>
              }
            />
            <Button
              variant="contained"
              disabled={!postContent.trim() || loading}
              onClick={handleCreatePost}
              endIcon={<SendIcon />}
            >
              Post
            </Button>
          </Box>
        </Paper>

        {/* Error display */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* List of posts */}
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Posts</Typography>
        
        {posts.length === 0 && !loading ? (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>No posts yet. Be the first to share your thoughts!</Typography>
          </Paper>
        ) : (
          posts.map(post => (
            <Card key={post._id} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: post.isAnonymous ? 'grey.500' : 'primary.main' }}>
                    {getAuthorInitial(post)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {getAuthorName(post)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(post.createdAt.toString())}
                    </Typography>
                  </Box>
                  {post.isAnonymous && (
                    <Chip 
                      icon={<VisibilityOffIcon fontSize="small" />} 
                      label="Anonymous" 
                      size="small" 
                      sx={{ ml: 'auto' }} 
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button 
                  startIcon={<ThumbUpIcon />} 
                  onClick={() => handleLikePost(post._id)}
                  color="primary"
                >
                  {post.likes > 0 ? post.likes : ''} Like
                </Button>
                <Button 
                  startIcon={<CommentIcon />} 
                  onClick={() => navigate(`/community/post/${post._id}`)}
                >
                  {post.comments.length > 0 ? post.comments.length : ''} Comment
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>
    </SharedLayout>
  );
};

export default CommunityPage; 