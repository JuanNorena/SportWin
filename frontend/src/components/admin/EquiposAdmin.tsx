import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Equipo, Liga } from '../../types';

interface EquipoCompleto extends Equipo {
  liga_nombre?: string;
  pais_nombre?: string;
  ciudad_nombre?: string;
}

export const EquiposAdmin = () => {
  const [equipos, setEquipos] = useState<EquipoCompleto[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<EquipoCompleto[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [paises, setPaises] = useState<{ id_pais: number; nombre: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id_ciudad: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterLiga, setFilterLiga] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    nombre: '',
    id_liga: 0,
    id_pais: 0,
    id_ciudad: 0,
    fundacion: '',
    logo_url: '',
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = equipos;

    if (filterStatus === 'active') {
      filtered = filtered.filter((e) => e.activo);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((e) => !e.activo);
    }

    if (filterLiga > 0) {
      filtered = filtered.filter((e) => e.id_liga === filterLiga);
    }

    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.nombre.toLowerCase().includes(search) ||
          (e.liga_nombre && e.liga_nombre.toLowerCase().includes(search)) ||
          (e.ciudad_nombre && e.ciudad_nombre.toLowerCase().includes(search))
      );
    }

    setFilteredEquipos(filtered);
  }, [equipos, searchText, filterLiga, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equiposData, ligasData, paisesData, ciudadesData] = await Promise.all([
        apiService.getEquipos(),
        apiService.getLigas(),
        apiService.getPaises(),
        apiService.getCiudades(),
      ]);
      setEquipos(equiposData as EquipoCompleto[]);
      setLigas(ligasData);
      setPaises(paisesData);
      setCiudades(ciudadesData);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        id_liga: formData.id_liga || undefined,
        id_pais: formData.id_pais || undefined,
        id_ciudad: formData.id_ciudad || undefined,
        fundacion: formData.fundacion ? parseInt(formData.fundacion) : undefined,
        logo_url: formData.logo_url || undefined,
      };

      if (editingId) {
        await apiService.updateEquipo(editingId, dataToSend);
      } else {
        await apiService.createEquipo(dataToSend);
      }
      
      await loadData();
      handleCancel();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
    }
  };

  const handleEdit = (equipo: EquipoCompleto) => {
    setEditingId(equipo.id_equipo);
    setFormData({
      nombre: equipo.nombre,
      id_liga: equipo.id_liga || 0,
      id_pais: equipo.id_pais || 0,
      id_ciudad: equipo.id_ciudad || 0,
      fundacion: equipo.fundacion ? equipo.fundacion.toString() : '',
      logo_url: equipo.logo_url || '',
      activo: equipo.activo ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return;
    
    try {
      await apiService.deleteEquipo(id);
      await loadData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      
      if (axiosError.response?.status === 409) {
        const errorMsg = axiosError.response.data?.error || 'No se puede eliminar este equipo porque tiene datos relacionados';
        setError(`⚠️ ${errorMsg}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
        setError(errorMessage);
      }
    }
  };

  const handleToggleStatus = async (equipo: EquipoCompleto) => {
    try {
      await apiService.updateEquipo(equipo.id_equipo, {
        ...equipo,
        activo: !equipo.activo,
      });
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado';
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      id_liga: 0,
      id_pais: 0,
      id_ciudad: 0,
      fundacion: '',
      logo_url: '',
      activo: true,
    });
  };

  if (loading && equipos.length === 0) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Equipos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Equipo'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filtros */}
      {!showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por nombre, liga, ciudad..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liga
              </label>
              <select
                value={filterLiga}
                onChange={(e) => setFilterLiga(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Todas</option>
                {ligas.map((l) => (
                  <option key={l.id_liga} value={l.id_liga}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Real Madrid"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liga *
                </label>
                <select
                  required
                  value={formData.id_liga}
                  onChange={(e) => setFormData({ ...formData, id_liga: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione una liga</option>
                  {ligas.map((liga) => (
                    <option key={liga.id_liga} value={liga.id_liga}>
                      {liga.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <select
                  value={formData.id_pais}
                  onChange={(e) => setFormData({ ...formData, id_pais: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Sin país</option>
                  {paises.map((pais) => (
                    <option key={pais.id_pais} value={pais.id_pais}>
                      {pais.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <select
                  value={formData.id_ciudad}
                  onChange={(e) => setFormData({ ...formData, id_ciudad: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Sin ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año de Fundación
                </label>
                <input
                  type="number"
                  value={formData.fundacion}
                  onChange={(e) => setFormData({ ...formData, fundacion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 1902"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Activo
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                País
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fundación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipos.map((equipo) => (
              <tr key={equipo.id_equipo} className={`hover:bg-gray-50 ${!equipo.activo ? 'bg-gray-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {equipo.id_equipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {equipo.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equipo.liga_nombre || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equipo.pais_nombre || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equipo.fundacion || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      equipo.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {equipo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(equipo)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(equipo)}
                    className={`${
                      equipo.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {equipo.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(equipo.id_equipo)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEquipos.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {equipos.length === 0 
            ? 'No hay equipos registrados. Crea uno para comenzar.'
            : 'No se encontraron equipos con los filtros aplicados.'
          }
        </div>
      )}
    </div>
  );
};
