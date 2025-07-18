import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface User {
  _id: string;
  username: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any previous auth data to ensure clean login
      localStorage.removeItem('user');
      
      const response = await axios.post(`${API_URL}/auth/login`, 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Make sure we get a token from the response
      if (!response.data || !response.data.token) {
        throw new Error("No authentication token received");
      }
      
      const userData = response.data;
      console.log("Login successful:", userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || 'Login failed - please check your credentials';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 