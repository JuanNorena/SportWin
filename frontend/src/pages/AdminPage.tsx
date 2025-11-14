import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { DeportesAdmin } from '../components/admin/DeportesAdmin';
import { LigasAdmin } from '../components/admin/LigasAdmin';
import { EquiposAdmin } from '../components/admin/EquiposAdmin';
import { PartidosAdmin } from '../components/admin/PartidosAdmin';

type TabType = 'deportes' | 'ligas' | 'equipos' | 'partidos';

export const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('deportes');

  // Verificar si el usuario es administrador
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'deportes' as TabType, label: 'Deportes', icon: '⚽' },
    { id: 'ligas' as TabType, label: 'Ligas', icon: '🏆' },
    { id: 'equipos' as TabType, label: 'Equipos', icon: '👕' },
    { id: 'partidos' as TabType, label: 'Partidos', icon: '📅' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deportes':
        return <DeportesAdmin />;
      case 'ligas':
        return <LigasAdmin />;
      case 'equipos':
        return <EquiposAdmin />;
      case 'partidos':
        return <PartidosAdmin />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Gestiona deportes, ligas, equipos y partidos del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-min">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {renderTabContent()}
      </div>
    </div>
  );
};
