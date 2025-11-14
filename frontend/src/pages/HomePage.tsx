import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">SPORTWIN</h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          Sistema de Apuestas Deportivas
        </p>
      </div>

      {isAuthenticated ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="border border-black p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 break-words">
              Bienvenido, {user?.nombre}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Explora los partidos disponibles y realiza tus apuestas.
            </p>
            <Link to="/partidos">
              <button className="btn-primary w-full text-sm sm:text-base">
                Ver Partidos Disponibles
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/partidos" className="border border-gray-300 p-4 hover:border-black transition-colors">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Partidos</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Explora los próximos eventos deportivos
              </p>
            </Link>

            <Link to="/apuestas" className="border border-gray-300 p-4 hover:border-black transition-colors">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Mis Apuestas</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Revisa tus apuestas activas
              </p>
            </Link>

            <Link to="/saldo" className="border border-gray-300 p-4 hover:border-black transition-colors sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Mi Saldo</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Administra tu saldo y transacciones
              </p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="border border-black p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Comienza a Apostar Ahora
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Regístrate para acceder a las mejores cuotas y eventos deportivos
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="btn-primary w-full sm:w-auto text-sm sm:text-base">Registrarse</button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="btn-secondary w-full sm:w-auto text-sm sm:text-base">Iniciar Sesión</button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Mejores Cuotas</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Ofrecemos las cuotas más competitivas del mercado
              </p>
            </div>

            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Múltiples Deportes</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Fútbol, baloncesto, tenis y muchos más
              </p>
            </div>

            <div className="border border-gray-300 p-4 sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold mb-2 text-sm sm:text-base">Transacciones Seguras</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Sistema de pagos confiable y rápido
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
