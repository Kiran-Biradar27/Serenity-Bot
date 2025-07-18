import { Request, Response } from 'express';
import Post from '../models/post.model';
import mongoose from 'mongoose';
import { IComment } from '../interfaces/post.interface';

// Enable lean queries for better performance
const LEAN_QUERY = { lean: true };

// @desc    Create a new post
// @route   POST /api/community/posts
// @access  Private
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, isAnonymous } = req.body;
    const userId = req.user._id;

    const post = await Post.create({
      content,
      author: userId,
      isAnonymous: isAnonymous || false,
    });

    // Return a lean object for better performance
    const postObj = post.toObject();
    
    res.status(201).json(postObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all posts
// @route   GET /api/community/posts
// @access  Private
export const getPosts = async (req: Request, res: Response) => {
  try {
    // Use lean() for better performance
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .lean();
    
    // If post is anonymous, remove author details
    const formattedPosts = posts.map(post => {
      if (post.isAnonymous) {
        post.author = { username: 'Anonymous User' };
      }
      return post;
    });
    
    res.json(formattedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a post by ID
// @route   GET /api/community/posts/:id
// @access  Private
export const getPostById = async (req: Request, res: Response) => {
  try {
    // Use lean() for better performance
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .lean();
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // If post is anonymous, remove author details
    if (post.isAnonymous) {
      post.author = { username: 'Anonymous User' };
    }
    
    // Format comments to hide author for anonymous comments
    post.comments = post.comments.map((comment: any) => {
      if (comment.isAnonymous) {
        return {
          ...comment,
          author: { username: 'Anonymous User' },
        };
      }
      return comment;
    });
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/community/posts/:id/comments
// @access  Private
export const addComment = async (req: Request, res: Response) => {
  try {
    const { content, isAnonymous } = req.body;
    const userId = req.user._id;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create a comment that matches the schema structure
    post.comments.push({
      content,
      author: userId,
      isAnonymous: isAnonymous || false,
      likes: 0,
      createdAt: new Date()
    } as unknown as IComment);
    
    await post.save();
    
    // Fetch the updated post with populated author fields for both post and comments
    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .lean();
    
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found after update' });
    }
    
    // Format the post to hide author details for anonymous content
    if (updatedPost.isAnonymous) {
      updatedPost.author = { username: 'Anonymous User' };
    }
    
    // Format comments to hide author for anonymous comments
    updatedPost.comments = updatedPost.comments.map((comment: any) => {
      if (comment.isAnonymous) {
        return {
          ...comment,
          author: { username: 'Anonymous User' },
        };
      }
      return comment;
    });
    
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like a post
// @route   PUT /api/community/posts/:id/like
// @access  Private
export const likePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.likes += 1;
    await post.save();
    
    res.json({ likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 