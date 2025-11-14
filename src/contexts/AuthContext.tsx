import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; 
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    // if (storedUser && storedUser !== 'undefined') {
    //   console.log('sotred user ' ,storedUser)
    //   setUser(JSON.parse(storedUser));
    // }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Login failed');
      }

      console.log(Response);

      const res_data = await res.json();
      const { message, data}  = res_data;
      const access_token = data.access_token
      const user = {
        firstName : data.first_name,
        lastName : data.last_name,   
        id : data.id,
        email : data.email,
        role : data.role
      }
      setUser(user);

      if(user)localStorage.setItem('user', JSON.stringify(user));
      if (access_token) localStorage.setItem('user', access_token);
      console.log("kolch riglou")
  
      navigate('/');
    } catch(e) {console.log('error before redircting ', e);}
    finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
