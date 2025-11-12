import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-black py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-black no-underline">
            SPORTWIN
          </Link>

          <nav className="flex gap-6 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/partidos" className="hover:underline">
                  Partidos
                </Link>
                <Link to="/apuestas" className="hover:underline">
                  Mis Apuestas
                </Link>
                <Link to="/saldo" className="hover:underline">
                  Mi Saldo
                </Link>
                <span className="text-gray-600">
                  {user?.nombre} {user?.apellido}
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Iniciar Sesión
                </Link>
                <Link to="/register">
                  <button className="btn-primary">Registrarse</button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-6 text-center text-sm text-gray-600">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 SportWin - Sistema de Apuestas Deportivas</p>
        </div>
      </footer>
    </div>
  );
};
