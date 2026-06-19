import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDashboardBootstrapData } from '../services/apiService'
import { buildDashboardStats, buildDetalleStatsIndex, buildLideresStats } from '../utils/dashboardStats'

const AppDataContext = createContext(undefined)

const getInitialState = () => {
  const empleados = []
  const reservas = []

  return {
    empleados,
    reservas,
    dashboardStats: buildDashboardStats(empleados, reservas),
    lideresStats: buildLideresStats(empleados, reservas),
    detalleStatsIndex: buildDetalleStatsIndex(empleados, reservas),
    loading: true,
    error: null,
  }
}

export function AppDataProvider({ children }) {
  const [state, setState] = useState(getInitialState)

  const buildDerivedState = useCallback((empleados, reservas) => {
    // Filtrar solo empleados con status/estado activo antes de calcular estadísticas
    const isActiveEmpleado = (empleado) => {
      if (!empleado) return false;

      // Si existe el campo `status`, priorizarlo (valor esperado: 'activo')
      if (empleado.status != null) {
        return empleado.status
          .toString()
          .toLowerCase()
          .trim() === 'activo';
      }

      // boolean flags
      if (typeof empleado.active === 'boolean') return empleado.active === true;
      if (typeof empleado.isActive === 'boolean') return empleado.isActive === true;

      // posibles campos de estado en distintas APIs
      const statusRaw = (
        empleado.estado || empleado.estado_empleado || ''
      ).toString().toLowerCase().trim();

      return (
        statusRaw === 'activo' ||
        statusRaw === 'active' ||
        statusRaw === '1' ||
        statusRaw === 'true'
      );
    };

    const empleadosActivos = Array.isArray(empleados)
      ? empleados.filter(isActiveEmpleado)
      : [];

    return {
      dashboardStats: buildDashboardStats(empleadosActivos, reservas),
      lideresStats: buildLideresStats(empleadosActivos, reservas),
      detalleStatsIndex: buildDetalleStatsIndex(empleadosActivos, reservas),
    }
  }, [])

  const loadSharedData = useCallback(async ({ forceRefresh = false, silent = false } = {}) => {
    if (!silent) {
      setState((previousState) => ({ ...previousState, loading: true, error: null }))
    } else {
      setState((previousState) => ({ ...previousState, error: null }))
    }

    try {
      const data = await getDashboardBootstrapData(forceRefresh)
      const derivedState = buildDerivedState(data.empleados, data.reservas)

      setState({
        empleados: data.empleados,
        reservas: data.reservas,
        ...derivedState,
        loading: false,
        error: null,
        hydratedFromStorage: true,
      })

      return data
    } catch (error) {
      setState((previousState) => ({
        ...previousState,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar los datos',
      }))

      throw error
    }
  }, [buildDerivedState])

  const patchReserva = useCallback((reservaId, attributesPatch) => {
    setState((previousState) => {
      if (previousState.reservas.length === 0) {
        return previousState
      }

      const reservas = previousState.reservas.map((reserva) => (
        reserva.id === reservaId
          ? {
              ...reserva,
              attributes: {
                ...reserva.attributes,
                ...attributesPatch,
              },
            }
          : reserva
      ))

      return {
        ...previousState,
        reservas,
        ...buildDerivedState(previousState.empleados, reservas),
      }
    })
  }, [buildDerivedState])

  const removeReserva = useCallback((reservaId) => {
    setState((previousState) => {
      if (previousState.reservas.length === 0) {
        return previousState
      }

      const reservas = previousState.reservas.filter((reserva) => reserva.id !== reservaId)

      return {
        ...previousState,
        reservas,
        ...buildDerivedState(previousState.empleados, reservas),
      }
    })
  }, [buildDerivedState])

  const refreshSharedData = useCallback(() => loadSharedData({ forceRefresh: true }), [loadSharedData])

  useEffect(() => {
    loadSharedData().catch(() => {})
  }, [loadSharedData])

  const value = useMemo(() => ({
    ...state,
    loadSharedData,
    patchReserva,
    removeReserva,
    refreshSharedData,
  }), [state, loadSharedData, patchReserva, removeReserva, refreshSharedData])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppDataProvider')
  }

  return context
}