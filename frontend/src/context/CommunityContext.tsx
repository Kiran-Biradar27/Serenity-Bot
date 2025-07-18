import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API_URL = 'http://localhost:5000/api';

// API request timeout - 5 seconds
const API_TIMEOUT = 5000; 

interface Comment {
  _id: string;
  content: string;
  author: {
    _id?: string;
    username: string;
  };
  isAnonymous: boolean;
  likes: number;
  createdAt: Date;
}

interface Post {
  _id: string;
  content: string;
  author: {
    _id?: string;
    username: string;
  };
  isAnonymous: boolean;
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

interface CommunityContextType {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  fetchPostById: (postId: string) => Promise<Post | null>;
  createPost: (content: string, isAnonymous: boolean) => Promise<void>;
  addComment: (postId: string, content: string, isAnonymous: boolean) => Promise<Post | null>;
  likePost: (postId: string) => Promise<void>;
  setCurrentPost: (post: Post | null) => void;
}

export const CommunityContext = createContext<CommunityContextType>({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  fetchPosts: async () => {},
  fetchPostById: async () => null,
  createPost: async () => {},
  addComment: async () => null,
  likePost: async () => {},
  setCurrentPost: () => {},
});

interface CommunityProviderProps {
  children: ReactNode;
}

// Create an optimized axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT
});

export const CommunityProvider = ({ children }: CommunityProviderProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  // Configure axios with authentication token
  const configureAxios = useCallback(() => {
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
  }, [user?.token]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/community/posts`, configureAxios());
      setPosts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [user, configureAxios]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const fetchPostById = useCallback(async (postId: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/community/posts/${postId}`, configureAxios());
      
      // Verify that we have author data for comments
      if (response.data && response.data.comments) {
        response.data.comments.forEach((comment: any, index: number) => {
          if (!comment.author) {
            console.warn(`Comment at index ${index} is missing author data`);
          }
        });
      }
      
      setCurrentPost(response.data);
      return response.data;
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError(err.response?.data?.message || 'Failed to fetch post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, configureAxios]);

  const createPost = useCallback(async (content: string, isAnonymous: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.post(
        `/community/posts`, 
        { content, isAnonymous }, 
        configureAxios()
      );
      
      // Add the new post to the start of the posts array instead of refetching all posts
      setPosts(prev => [response.data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  }, [user, configureAxios]);

  const addComment = useCallback(async (postId: string, content: string, isAnonymous: boolean) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(
        `/community/posts/${postId}/comments`, 
        { content, isAnonymous }, 
        configureAxios()
      );
      
      // Response should have populated author fields now
      if (response.data) {
        // Update current post if this is the one we're viewing
        if (currentPost && currentPost._id === postId) {
          setCurrentPost(response.data);
        }
        
        // Update post in the list
        setPosts(prev => 
          prev.map(post => 
            post._id === postId ? response.data : post
          )
        );
        
        return response.data;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Error adding comment:", err);
      setError(err.response?.data?.message || 'Failed to add comment');
      throw err; // Rethrow to allow handling in the component
    } finally {
      setLoading(false);
    }
  }, [user, configureAxios, currentPost]);

  const likePost = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.put(
        `/community/posts/${postId}/like`, 
        {}, 
        configureAxios()
      );
      
      // Update likes count in the current post and posts list
      const updatedLikes = response.data.likes;
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(prev => prev ? { ...prev, likes: updatedLikes } : null);
      }
      
      setPosts(prev => 
        prev.map(post => 
          post._id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like post');
    } finally {
      setLoading(false);
    }
  }, [user, configureAxios, currentPost]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    createPost,
    addComment,
    likePost,
    setCurrentPost,
  }), [
    posts, 
    currentPost, 
    loading, 
    error, 
    fetchPosts, 
    fetchPostById, 
    createPost, 
    addComment, 
    likePost
  ]);

  return (
    <CommunityContext.Provider value={contextValue}>
      {children}
    </CommunityContext.Provider>
  );
};

export default CommunityProvider; 