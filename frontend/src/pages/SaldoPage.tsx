import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { TransaccionDetallada, MetodoPago } from '../types';

export const SaldoPage: React.FC = () => {
  const { apostador, loading: authLoading } = useAuth();
  const [transacciones, setTransacciones] = useState<TransaccionDetallada[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para formulario de depósito
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMetodo, setDepositMetodo] = useState('');
  const [depositReferencia, setDepositReferencia] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Estado para formulario de retiro
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMetodo, setWithdrawMetodo] = useState('');
  const [withdrawReferencia, setWithdrawReferencia] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const loadTransacciones = async () => {
      if (!apostador) return;

      setLoading(true);
      setError('');

      try {
        const data = await apiService.getTransaccionesByApostador(apostador.id_apostador);
        setTransacciones(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    const loadMetodosPago = async () => {
      try {
        const data = await apiService.getMetodosPago();
        setMetodosPago(data.filter(m => m.activo));
        if (data.length > 0) {
          setDepositMetodo(data[0].id_metodo_pago.toString());
          setWithdrawMetodo(data[0].id_metodo_pago.toString());
        }
      } catch (err: unknown) {
        console.error('Error al cargar métodos de pago:', err);
      }
    };

    if (apostador) {
      loadTransacciones();
      loadMetodosPago();
    }
  }, [apostador, reloadTrigger]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apostador) return;

    setDepositLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.createDeposito({
        id_apostador: apostador.id_apostador,
        monto: parseFloat(depositAmount),
        id_metodo_pago: parseInt(depositMetodo),
        referencia: depositReferencia || undefined,
      });

      setSuccessMessage('Depósito realizado exitosamente');
      setShowDepositForm(false);
      setDepositAmount('');
      setDepositReferencia('');
      
      // Recargar transacciones y actualizar saldo
      setReloadTrigger(prev => prev + 1);
      
      // Actualizar el apostador en el contexto después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al realizar depósito');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apostador) return;

    setWithdrawLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.createRetiro({
        id_apostador: apostador.id_apostador,
        monto: parseFloat(withdrawAmount),
        id_metodo_pago: parseInt(withdrawMetodo),
        referencia: withdrawReferencia || undefined,
      });

      setSuccessMessage('Retiro realizado exitosamente');
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setWithdrawReferencia('');
      
      // Recargar transacciones y actualizar saldo
      setReloadTrigger(prev => prev + 1);
      
      // Actualizar el apostador en el contexto después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al realizar retiro');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mostrar loading mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!apostador) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Debe iniciar sesión para ver su saldo</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Mi Saldo</h1>

        {/* Saldo actual */}
        <div className="border-2 border-black p-8 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Saldo Disponible</p>
          <p className="text-5xl font-bold mb-4">{formatCurrency(apostador.saldo_actual)}</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowDepositForm(true);
                setShowWithdrawForm(false);
                setError('');
                setSuccessMessage('');
              }}
              className="btn-primary"
            >
              💰 Depositar
            </button>
            <button
              onClick={() => {
                setShowWithdrawForm(true);
                setShowDepositForm(false);
                setError('');
                setSuccessMessage('');
              }}
              className="btn-secondary"
              disabled={apostador.saldo_actual <= 0}
            >
              💳 Retirar
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-600 text-red-600">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-600 text-green-600">
            {successMessage}
          </div>
        )}

        {/* Formulario de depósito */}
        {showDepositForm && (
          <div className="border border-gray-300 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Realizar Depósito</h2>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Monto</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  min="1000"
                  step="1000"
                  disabled={depositLoading}
                  placeholder="Ingrese el monto a depositar"
                />
                <p className="text-sm text-gray-600 mt-1">Monto mínimo: $1,000</p>
              </div>

              <div>
                <label className="block mb-2 font-medium">Método de Pago</label>
                <select
                  value={depositMetodo}
                  onChange={(e) => setDepositMetodo(e.target.value)}
                  required
                  disabled={depositLoading}
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.id_metodo_pago} value={metodo.id_metodo_pago}>
                      {metodo.nombre} {metodo.comision > 0 && `(Comisión: ${metodo.comision}%)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Referencia (Opcional)</label>
                <input
                  type="text"
                  value={depositReferencia}
                  onChange={(e) => setDepositReferencia(e.target.value)}
                  disabled={depositLoading}
                  placeholder="Número de confirmación, código, etc."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="btn-primary"
                >
                  {depositLoading ? 'Procesando...' : 'Confirmar Depósito'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositForm(false);
                    setDepositAmount('');
                    setDepositReferencia('');
                  }}
                  disabled={depositLoading}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario de retiro */}
        {showWithdrawForm && (
          <div className="border border-gray-300 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Realizar Retiro</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Monto</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  min="1000"
                  max={apostador.saldo_actual}
                  step="1000"
                  disabled={withdrawLoading}
                  placeholder="Ingrese el monto a retirar"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Saldo disponible: {formatCurrency(apostador.saldo_actual)}
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">Método de Pago</label>
                <select
                  value={withdrawMetodo}
                  onChange={(e) => setWithdrawMetodo(e.target.value)}
                  required
                  disabled={withdrawLoading}
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.id_metodo_pago} value={metodo.id_metodo_pago}>
                      {metodo.nombre} {metodo.comision > 0 && `(Comisión: ${metodo.comision}%)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Referencia (Opcional)</label>
                <input
                  type="text"
                  value={withdrawReferencia}
                  onChange={(e) => setWithdrawReferencia(e.target.value)}
                  disabled={withdrawLoading}
                  placeholder="Número de cuenta, documento, etc."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="btn-primary"
                >
                  {withdrawLoading ? 'Procesando...' : 'Confirmar Retiro'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawForm(false);
                    setWithdrawAmount('');
                    setWithdrawReferencia('');
                  }}
                  disabled={withdrawLoading}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Historial de transacciones */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Historial de Transacciones</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando transacciones...</p>
          </div>
        ) : transacciones.length === 0 ? (
          <div className="text-center py-12 border border-gray-300">
            <p className="text-gray-600">No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Fecha</th>
                  <th className="border border-gray-300 p-3 text-left">Tipo</th>
                  <th className="border border-gray-300 p-3 text-left">Descripción</th>
                  <th className="border border-gray-300 p-3 text-right">Monto</th>
                  <th className="border border-gray-300 p-3 text-right">Comisión</th>
                  <th className="border border-gray-300 p-3 text-right">Monto Neto</th>
                  <th className="border border-gray-300 p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((transaccion) => (
                  <tr key={transaccion.id_transaccion} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-sm">
                      {formatDate(transaccion.fecha)}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <span className="text-sm font-medium">{transaccion.tipo}</span>
                      {transaccion.metodo_pago && (
                        <p className="text-xs text-gray-600">{transaccion.metodo_pago}</p>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-sm">
                      {transaccion.descripcion}
                      {transaccion.partido && (
                        <p className="text-xs text-gray-600 mt-1">{transaccion.partido}</p>
                      )}
                      {transaccion.referencia && (
                        <p className="text-xs text-gray-600 mt-1">Ref: {transaccion.referencia}</p>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-medium">
                      <span className={
                        transaccion.tipo === 'Depósito' || transaccion.tipo === 'Ganancia' || transaccion.tipo === 'Reembolso'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }>
                        {transaccion.tipo === 'Depósito' || transaccion.tipo === 'Ganancia' || transaccion.tipo === 'Reembolso' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaccion.monto))}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-right text-sm">
                      {transaccion.comision > 0 ? formatCurrency(transaccion.comision) : '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-bold">
                      {formatCurrency(transaccion.monto_neto)}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`text-xs px-2 py-1 border ${
                        transaccion.estado === 'Completada'
                          ? 'border-green-600 text-green-600'
                          : transaccion.estado === 'Pendiente'
                          ? 'border-yellow-600 text-yellow-600'
                          : 'border-red-600 text-red-600'
                      }`}>
                        {transaccion.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
