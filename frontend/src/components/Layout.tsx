import React, { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-black no-underline">
              SPORTWIN
            </Link>

            {/* Hamburger Menu Button - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-black transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-black transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-black transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 lg:gap-6 items-center flex-wrap">
              {isAuthenticated ? (
                <>
                  <Link to="/partidos" className="hover:underline text-sm lg:text-base whitespace-nowrap">
                    Partidos
                  </Link>
                  <Link to="/apuestas" className="hover:underline text-sm lg:text-base whitespace-nowrap">
                    Mis Apuestas
                  </Link>
                  <Link to="/saldo" className="hover:underline text-sm lg:text-base whitespace-nowrap">
                    Mi Saldo
                  </Link>
                  <Link to="/reportes" className="hover:underline text-sm lg:text-base whitespace-nowrap">
                    Reportes
                  </Link>
                  {user?.rol === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="hover:underline text-blue-600 font-semibold text-sm lg:text-base whitespace-nowrap"
                    >
                      🔧 Admin
                    </Link>
                  )}
                  <span className="text-gray-600 text-sm lg:text-base hidden lg:inline">
                    {user?.nombre} {user?.apellido}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-secondary text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5 whitespace-nowrap"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline text-sm lg:text-base">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register">
                    <button className="btn-primary text-sm lg:text-base px-3 py-1.5">Registrarse</button>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-3 pb-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/partidos" 
                    className="hover:underline py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Partidos
                  </Link>
                  <Link 
                    to="/apuestas" 
                    className="hover:underline py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Apuestas
                  </Link>
                  <Link 
                    to="/saldo" 
                    className="hover:underline py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Saldo
                  </Link>
                  <Link 
                    to="/reportes" 
                    className="hover:underline py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reportes
                  </Link>
                  {user?.rol === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="hover:underline text-blue-600 font-semibold py-2 border-b border-gray-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔧 Admin
                    </Link>
                  )}
                  <div className="py-2 text-gray-600 border-b border-gray-200">
                    {user?.nombre} {user?.apellido}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn-secondary text-sm w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:underline py-2 border-b border-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="btn-primary w-full">Registrarse</button>
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-6 text-center text-sm text-gray-600">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 SportWin - Sistema de Apuestas Deportivas</p>
        </div>
      </footer>
    </div>
  );
};
