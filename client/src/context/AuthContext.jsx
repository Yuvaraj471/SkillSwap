import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [toast, setToast] = useState(null);

  // Configure axios default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        fetchNotificationCount();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err?.response?.data?.message || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Silent error
    }
  };

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, isAdminLogin });
      if (res.data.success) {
        const newToken = res.data.token;
        localStorage.setItem('skillswap_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setUser(res.data.data);
        setToken(newToken);
        showToast(`Welcome back, ${res.data.data.name}!`, 'success');
        return { success: true, user: res.data.data };
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        const newToken = res.data.token;
        localStorage.setItem('skillswap_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setUser(res.data.data);
        setToken(newToken);
        showToast('Registration successful! Welcome to SkillSwap.', 'success');
        return { success: true, user: res.data.data };
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        unreadNotifications,
        fetchNotificationCount,
        login,
        register,
        logout,
        updateUserState,
        showToast,
        toast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
