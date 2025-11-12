import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">SPORTWIN</h1>
        <p className="text-xl text-gray-600">
          Sistema de Apuestas Deportivas
        </p>
      </div>

      {isAuthenticated ? (
        <div className="space-y-6">
          <div className="border border-black p-6">
            <h2 className="text-2xl font-bold mb-4">
              Bienvenido, {user?.nombre}
            </h2>
            <p className="text-gray-600 mb-6">
              Explora los partidos disponibles y realiza tus apuestas.
            </p>
            <Link to="/partidos">
              <button className="btn-primary w-full">
                Ver Partidos Disponibles
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Link to="/partidos" className="border border-gray-300 p-4 hover:border-black transition-colors">
              <h3 className="font-bold mb-2">Partidos</h3>
              <p className="text-sm text-gray-600">
                Explora los próximos eventos deportivos
              </p>
            </Link>

            <Link to="/apuestas" className="border border-gray-300 p-4 hover:border-black transition-colors">
              <h3 className="font-bold mb-2">Mis Apuestas</h3>
              <p className="text-sm text-gray-600">
                Revisa tus apuestas activas
              </p>
            </Link>

            <Link to="/saldo" className="border border-gray-300 p-4 hover:border-black transition-colors">
              <h3 className="font-bold mb-2">Mi Saldo</h3>
              <p className="text-sm text-gray-600">
                Administra tu saldo y transacciones
              </p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-black p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Comienza a Apostar Ahora
            </h2>
            <p className="text-gray-600 mb-6">
              Regístrate para acceder a las mejores cuotas y eventos deportivos
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <button className="btn-primary">Registrarse</button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary">Iniciar Sesión</button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-2">Mejores Cuotas</h3>
              <p className="text-sm text-gray-600">
                Ofrecemos las cuotas más competitivas del mercado
              </p>
            </div>

            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-2">Múltiples Deportes</h3>
              <p className="text-sm text-gray-600">
                Fútbol, baloncesto, tenis y muchos más
              </p>
            </div>

            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-2">Transacciones Seguras</h3>
              <p className="text-sm text-gray-600">
                Sistema de pagos confiable y rápido
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
