import express from 'express';
import { createPost, getPosts, getPostById, addComment, likePost } from '../controllers/community.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes for community posts
router.post('/posts', createPost);
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts/:id/comments', addComment);
router.put('/posts/:id/like', likePost);

export default router; 