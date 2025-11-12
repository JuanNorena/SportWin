import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, Apostador } from '../types';

interface AuthContextType {
  user: User | null;
  apostador: Apostador | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSaldo: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  documento?: string;
  id_tipo_documento?: number;
  telefono?: string;
  direccion?: string;
  id_ciudad?: number;
  fecha_nacimiento?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apostador, setApostador] = useState<Apostador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar recuperar sesión del localStorage
    const savedUser = localStorage.getItem('user');
    const savedApostador = localStorage.getItem('apostador');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
      }
    }
    if (savedApostador) {
      try {
        setApostador(JSON.parse(savedApostador));
      } catch (e) {
        console.error('Error parsing apostador from localStorage:', e);
        localStorage.removeItem('apostador');
      }
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      console.log('Login response:', response); // Debug
      console.log('User:', response.user); // Debug
      console.log('Apostador:', response.apostador); // Debug
      
      setUser(response.user);
      setApostador(response.apostador || null);

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.apostador) {
        localStorage.setItem('apostador', JSON.stringify(response.apostador));
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await apiService.register(data);
      // Después del registro, hacer login automático
      await login(data.username, data.password);
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setApostador(null);
    localStorage.removeItem('user');
    localStorage.removeItem('apostador');
    apiService.logout();
  };

  const refreshSaldo = async () => {
    if (!apostador) return;
    try {
      const saldoData = await apiService.getApostadorSaldo(apostador.id_apostador);
      const updatedApostador = { ...apostador, saldo_actual: saldoData.saldo_actual };
      setApostador(updatedApostador);
      localStorage.setItem('apostador', JSON.stringify(updatedApostador));
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
    }
  };

  const value = {
    user,
    apostador,
    loading,
    login,
    register,
    logout,
    refreshSaldo,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
