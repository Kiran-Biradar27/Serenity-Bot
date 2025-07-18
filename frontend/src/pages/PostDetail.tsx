import React, { useState, useContext, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import SharedLayout from '../components/SharedLayout';
import { CommunityContext } from '../context/CommunityContext';
import { AuthContext } from '../context/AuthContext';

// Create a separate component that uses a simple form - memoized for better performance
const CommentFormIframe = memo(({ 
  onComment, 
  username, 
  onReady 
}: { 
  onComment: (content: string, isAnonymous: boolean) => void;
  username: string;
  onReady: (iframe: HTMLIFrameElement) => void;
}) => {
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  
  // Handle iframe ref
  const handleIframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      onReady(iframe);
      internalIframeRef.current = iframe;
    }
  }, [onReady]);
  
  // Set up the iframe content when the component mounts
  useEffect(() => {
    if (internalIframeRef.current && internalIframeRef.current.contentWindow) {
      const iframeDoc = internalIframeRef.current.contentWindow.document;
      
      // Create the form content with vanilla HTML/CSS/JS
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: transparent;
            }
            .comment-form {
              padding: 0;
            }
            textarea {
              width: 100%;
              padding: 12px;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              font-family: inherit;
              font-size: 1rem;
              resize: vertical;
              min-height: 100px;
              margin-bottom: 16px;
              box-sizing: border-box;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .anonymous-label {
              display: flex;
              align-items: center;
              cursor: pointer;
            }
            .anonymous-checkbox {
              margin: 0 8px 0 0;
              width: 20px;
              height: 20px;
            }
            .btn {
              background-color: #1976d2;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              display: flex;
              align-items: center;
              transition: all 0.2s;
            }
            .btn:hover {
              background-color: #1565c0;
            }
            .btn:disabled {
              background-color: #ccc;
              cursor: not-allowed;
            }
            .icon {
              margin-right: 8px;
            }
            .user-info {
              font-size: 0.875rem;
              color: #666;
              margin-bottom: 8px;
            }
            #status {
              color: #f44336;
              margin-top: 8px;
              font-size: 0.875rem;
              min-height: 20px;
            }
            .success {
              color: #4caf50 !important;
            }
          </style>
        </head>
        <body>
          <div class="comment-form">
            <div class="user-info">Commenting as: <strong>${username || 'Guest'}</strong></div>
            <textarea id="comment-text" placeholder="Write a comment..."></textarea>
            <div class="footer">
              <label class="anonymous-label">
                <input type="checkbox" id="anonymous-check" class="anonymous-checkbox">
                <span id="anon-label">
                  <svg class="icon" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                  </svg>
                  Anonymous
                </span>
              </label>
              <button class="btn" id="submit-btn">
                <svg class="icon" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
                Comment
              </button>
            </div>
            <div id="status"></div>
          </div>
          <script>
            // Signal the parent that the iframe is ready
            window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
            
            // Comment submission handler
            document.getElementById('submit-btn').addEventListener('click', function() {
              const submitBtn = this;
              const content = document.getElementById('comment-text').value.trim();
              const isAnonymous = document.getElementById('anonymous-check').checked;
              const statusEl = document.getElementById('status');
              
              if (!content) {
                statusEl.textContent = "Please enter a comment";
                statusEl.className = "";
                return;
              }
              
              // Immediately disable the button and show submitting status
              submitBtn.disabled = true;
              statusEl.textContent = "Submitting...";
              statusEl.className = "";
              
              try {
                // Send message to parent window
                window.parent.postMessage({
                  type: 'COMMENT_SUBMIT',
                  content: content,
                  isAnonymous: isAnonymous
                }, '*');
                
                // Clear the text immediately for better UX
                document.getElementById('comment-text').value = '';
                
                // Show temporary success message - will be updated by parent response
                statusEl.textContent = "Comment submitted...";
                statusEl.className = "success";
                
                // Keep button disabled until we get confirmation
              } catch (e) {
                submitBtn.disabled = false;
                statusEl.textContent = "Error: " + e.message;
                statusEl.className = "";
                console.error(e);
              }
            });
            
            // Listen for messages from parent
            window.addEventListener('message', function(event) {
              const submitBtn = document.getElementById('submit-btn');
              const statusEl = document.getElementById('status');
              
              if (event.data && event.data.type === 'COMMENT_STATUS') {
                // Re-enable the button
                submitBtn.disabled = false;
                
                if (event.data.success) {
                  statusEl.textContent = event.data.message || "Comment added successfully";
                  statusEl.className = "success";
                } else {
                  statusEl.textContent = event.data.message || "Failed to add comment";
                  statusEl.className = "";
                }
                
                // Clear status after a delay
                setTimeout(() => {
                  statusEl.textContent = "";
                }, 3000);
              }
            });
            
            // Update icon when anonymous checkbox changes
            document.getElementById('anonymous-check').addEventListener('change', function() {
              const label = document.getElementById('anon-label');
              if (this.checked) {
                label.innerHTML = \`
                  <svg class="icon" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>
                  </svg>
                  Anonymous
                \`;
              } else {
                label.innerHTML = \`
                  <svg class="icon" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                  </svg>
                  Anonymous
                \`;
              }
            });
          </script>
        </body>
        </html>
      `);
      iframeDoc.close();
      
      // Mark the iframe as ready after a short delay to ensure it's fully loaded
      setTimeout(() => {
        setIframeReady(true);
      }, 100);
    }
  }, [username]);

  // Set up the event listener for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'IFRAME_READY') {
        setIframeReady(true);
      } else if (event.data && event.data.type === 'COMMENT_SUBMIT' && iframeReady) {
        try {
          // Call the parent component's handler
          onComment(event.data.content, event.data.isAnonymous);
          
          // We'll let the parent component handle success/error
        } catch (error) {
          console.error('Error in comment submission:', error);
          
          // Notify the iframe of failure
          if (internalIframeRef.current && internalIframeRef.current.contentWindow) {
            internalIframeRef.current.contentWindow.postMessage({
              type: 'COMMENT_STATUS',
              success: false,
              message: 'Failed to submit comment'
            }, '*');
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComment, iframeReady, internalIframeRef]);

  return (
    <iframe 
      ref={handleIframeRef}
      style={{
        width: '100%',
        height: '220px',
        border: 'none',
        overflow: 'hidden',
        background: 'transparent'
      }}
      title="Comment Form"
    />
  );
});

// Memoized comment item component
const CommentItem = memo(({ 
  comment, 
  formatDate, 
  formatTime, 
  isLast 
}: { 
  comment: any, 
  formatDate: (date: string) => string, 
  formatTime: (date: string) => string,
  isLast: boolean
}) => {
  // Helper function to safely get the author's initial
  const getAuthorInitial = (author: any, isAnonymous: boolean) => {
    if (isAnonymous) return 'A';
    if (!author || !author.username) return '?';
    return author.username.charAt(0).toUpperCase();
  };

  // Helper function to safely get the author's username
  const getAuthorName = (author: any, isAnonymous: boolean) => {
    if (isAnonymous) return 'Anonymous User';
    if (!author || !author.username) return 'Unknown User';
    return author.username;
  };

  return (
    <React.Fragment>
      <ListItem alignItems="flex-start" sx={{ p: 3 }}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: comment.isAnonymous ? 'grey.500' : 'secondary.main' }}>
            {getAuthorInitial(comment.author, comment.isAnonymous)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {getAuthorName(comment.author, comment.isAnonymous)}
              </Typography>
              {comment.isAnonymous && (
                <Chip 
                  icon={<VisibilityOffIcon fontSize="small" />} 
                  label="Anonymous" 
                  size="small" 
                  sx={{ ml: 1 }} 
                  variant="outlined"
                />
              )}
            </Box>
          }
          secondary={
            <>
              <Typography
                component="span"
                variant="body1"
                color="text.primary"
                sx={{ display: 'block', my: 1 }}
              >
                {comment.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt.toString())} at {formatTime(comment.createdAt.toString())}
              </Typography>
            </>
          }
        />
      </ListItem>
      {!isLast && <Divider variant="inset" component="li" />}
    </React.Fragment>
  );
});

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPost, loading, error: contextError, fetchPostById, addComment, likePost, setCurrentPost } = useContext(CommunityContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [commentStatus, setCommentStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle the iframe being ready
  const handleIframeReady = useCallback((iframe: HTMLIFrameElement) => {
    iframeRef.current = iframe;
  }, []);

  useEffect(() => {
    if (id) {
      fetchPostById(id);
    }
  }, [id, fetchPostById]);

  const handleAddComment = useCallback(async (content: string, isAnonymous: boolean) => {
    if (!id) {
      console.error("No post ID available");
      setCommentStatus({msg: "Error: No post ID available", type: 'error'});
      return;
    }
    
    if (!user) {
      console.error("User not authenticated");
      setCommentStatus({msg: "Error: User not authenticated", type: 'error'});
      return;
    }
    
    setLocalLoading(true);
    
    try {
      // Add comment optimistically to the UI
      if (currentPost && user) {
        // Create a temporary optimistic comment
        const optimisticComment = {
          _id: `temp-${Date.now()}`,
          content,
          author: {
            _id: user._id,
            username: isAnonymous ? 'Anonymous User' : user.username
          },
          isAnonymous,
          likes: 0,
          createdAt: new Date()
        };
        
        // Add to the current post temporarily
        const updatedPost = {
          ...currentPost,
          comments: [...currentPost.comments, optimisticComment]
        };
        
        // Update UI immediately
        setCurrentPost(updatedPost);
      }
      
      // Actually send to server
      const result = await addComment(id, content, isAnonymous);
      
      // Update with the real server response (which includes the real comment ID)
      if (result) {
        setCurrentPost(result);
      }
      
      // Show success
      setCommentStatus({msg: "Comment added successfully", type: 'success'});
      
      // Send success message to iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'COMMENT_STATUS',
          success: true,
          message: 'Comment added successfully'
        }, '*');
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      
      // If we get here and have currentPost, remove the optimistic comment
      if (currentPost && id) {
        // Refresh to get the real state - we ignore the return value
        // since we're just interested in triggering the state update through the context
        fetchPostById(id).catch(e => console.error("Error refreshing post:", e));
      }
      
      setCommentStatus({msg: "Failed to add comment. Please try again.", type: 'error'});
      
      // Send error message to iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'COMMENT_STATUS',
          success: false,
          message: 'Failed to add comment. Please try again.'
        }, '*');
      }
    } finally {
      setLocalLoading(false);
    }
  }, [id, user, currentPost, addComment, setCurrentPost, fetchPostById]);

  const handleLikePost = useCallback(async () => {
    if (!id) return;
    await likePost(id);
  }, [id, likePost]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Helper function to safely get the author's initial
  const getAuthorInitial = useCallback((author: any, isAnonymous: boolean) => {
    if (isAnonymous) return 'A';
    if (!author || !author.username) return '?';
    return author.username.charAt(0).toUpperCase();
  }, []);

  // Helper function to safely get the author's username
  const getAuthorName = useCallback((author: any, isAnonymous: boolean) => {
    if (isAnonymous) return 'Anonymous User';
    if (!author || !author.username) return 'Unknown User';
    return author.username;
  }, []);

  if (loading && !currentPost) {
    return (
      <SharedLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </SharedLayout>
    );
  }

  if (contextError) {
    return (
      <SharedLayout>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mb: 2 }}>
            Back to Community
          </Button>
          <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{contextError}</Typography>
          </Paper>
        </Box>
      </SharedLayout>
    );
  }

  if (!currentPost) {
    return (
      <SharedLayout>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mb: 2 }}>
            Back to Community
          </Button>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Post not found</Typography>
          </Paper>
        </Box>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/community')} 
          sx={{ mb: 2 }}
        >
          Back to Community
        </Button>

        {/* Post card */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: currentPost.isAnonymous ? 'grey.500' : 'primary.main' }}>
                {getAuthorInitial(currentPost.author, currentPost.isAnonymous)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {getAuthorName(currentPost.author, currentPost.isAnonymous)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(currentPost.createdAt.toString())}
                </Typography>
              </Box>
              {currentPost.isAnonymous && (
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
              {currentPost.content}
            </Typography>
          </CardContent>
          <Divider />
          <CardActions>
            <Button 
              startIcon={<ThumbUpIcon />} 
              onClick={handleLikePost}
              color="primary"
            >
              {currentPost.likes > 0 ? currentPost.likes : ''} Like
            </Button>
          </CardActions>
        </Card>

        {/* Comments section */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comments ({currentPost.comments.length})
        </Typography>

        {/* Show loading overlay when submitting a comment */}
        <Box position="relative">
          {localLoading && (
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              bottom={0} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bgcolor="rgba(255,255,255,0.7)"
              zIndex={10}
              borderRadius={2}
            >
              <CircularProgress />
            </Box>
          )}
          
          {/* Comment form */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Add a Comment</Typography>
            <CommentFormIframe 
              onComment={handleAddComment} 
              username={user?.username || 'Guest'} 
              onReady={handleIframeReady}
            />
          </Paper>
        </Box>

        {/* Comments list with optimistic update */}
        {currentPost.comments.length > 0 ? (
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {currentPost.comments.map((comment, index) => (
                <CommentItem 
                  key={comment._id}
                  comment={comment}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  isLast={index === currentPost.comments.length - 1}
                />
              ))}
            </List>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>No comments yet. Be the first to share your thoughts!</Typography>
          </Paper>
        )}

        {/* Status Snackbar */}
        <Snackbar 
          open={!!commentStatus} 
          autoHideDuration={6000} 
          onClose={() => setCommentStatus(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setCommentStatus(null)} 
            severity={commentStatus?.type || 'info'} 
            sx={{ width: '100%' }}
          >
            {commentStatus?.msg || ''}
          </Alert>
        </Snackbar>
      </Box>
    </SharedLayout>
  );
};

export default PostDetail; 