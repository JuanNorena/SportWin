import db from '../utils/database';

/**
 * ReporteResultado
 * 
 * Interfaz que define la estructura del resultado devuelto por las consultas
 * dinámicas de reportes. Contiene los nombres de columnas (columns) y las
 * filas como arreglos de objetos donde la llave es el nombre de la columna.
 *
 * Ejemplo:
 * {
 *   columns: ['id', 'nombre'],
 *   rows: [{ id: 1, nombre: 'example' }]
 * }
 */
interface ReporteResultado {
  /** Lista de nombres de columna devueltos por la consulta */
  columns: string[];
  /** Filas del resultado, cada fila es un mapa key/value con valores primitivos */
  rows: Record<string, unknown>[];
}

/**
 * Mapeo de reportes a su consulta SQL.
 *
 * Cada entrada del objeto corresponde a una consulta (reporte) y su valor es una
 * función que recibe `params` (mapa de parámetros en formato string) y devuelve
 * la consulta SQL ya interpolada. Este enfoque simplifica la interacción a
 * nivel de servicio, pero se debe tener especial cuidado con la interpolación
 * directa (riesgo de inyección SQL). Recomendación: migrar a prepared statements
 * (consultas parametrizadas) y validar/sanitizar los parámetros antes de usarlos.
 */
const reportesSQL: Record<string, (params: Record<string, string>) => string> = {
  // ==================== CONSULTAS SIMPLES ====================
  
  /**
   * partidos_por_mes
   *
   * Parámetros:
   * - `mes`: número del mes (1..12)
   * - `anio`: año (ej. 2024)
   *
   * Devuelve los partidos finalizados en un mes y año especificados con información
   * mínima: equipos local/visitante, estado, goles y liga.
   */
  partidos_por_mes: (params) => `
    -- Selecciona detalles del partido y nombres de equipos
    SELECT 
      p.id_partido,
      el.nombre AS equipo_local,
      ev.nombre AS equipo_visitante,
      p.fecha_hora,
      l.nombre AS liga,
      e.nombre AS estado,
      r.goles_local,
      r.goles_visitante
    FROM Partido p
    -- Une con equipos para obtener nombres
    JOIN Equipo el ON p.id_equipo_local = el.id_equipo
    JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN Liga l ON p.id_liga = l.id_liga
    JOIN Estado e ON p.id_estado = e.id_estado
    -- Obtiene resultados si existen
    LEFT JOIN Resultado r ON p.id_partido = r.id_partido
    -- Filtra por mes, año y estado finalizado
    WHERE EXTRACT(MONTH FROM p.fecha_hora) = ${params.mes}
      AND EXTRACT(YEAR FROM p.fecha_hora) = ${params.anio}
      AND e.codigo = 'FINALIZADO'
    ORDER BY p.fecha_hora DESC
  `,

  /**
   * apostadores_activos
   *
   * Parámetros:
   * - `monto`: Monto mínimo de saldo (`saldo_actual`) para filtrar apostadores.
   *
   * Devuelve lista de apostadores con saldo superior al parámetro especificado
   * ordenados por saldo descendente. Incluye información de usuario básica
   * y estado de verificación.
   */
  apostadores_activos: (params) => `
    -- Selecciona información del apostador y usuario
    SELECT 
      a.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      a.documento,
      a.telefono,
      a.saldo_actual,
      a.fecha_registro,
      a.verificado
    FROM Apostador a
    JOIN Usuario u ON a.id_usuario = u.id_usuario
    -- Filtra por saldo mínimo
    WHERE a.saldo_actual > ${params.monto}
    ORDER BY a.saldo_actual DESC
  `,

  /**
   * ligas_por_deporte
   *
   * Parámetros:
   * - `id_deporte`: id del deporte a consultar.
   *
   * Devuelve ligas asociadas a un deporte, con información de país, temporada, y
   * contadores como total de equipos y partidos.
   */
  ligas_por_deporte: (params) => `
    -- Obtiene estadísticas de ligas para un deporte
    SELECT 
      l.id_liga,
      l.nombre AS liga,
      p.nombre AS pais,
      l.temporada,
      l.fecha_inicio,
      l.fecha_fin,
      -- Cuenta equipos y partidos únicos
      COUNT(DISTINCT e.id_equipo) AS total_equipos,
      COUNT(DISTINCT pa.id_partido) AS total_partidos,
      l.activo
    FROM Liga l
    LEFT JOIN Pais p ON l.id_pais = p.id_pais
    LEFT JOIN Equipo e ON l.id_liga = e.id_liga
    LEFT JOIN Partido pa ON l.id_liga = pa.id_liga
    WHERE l.id_deporte = ${params.id_deporte}
    GROUP BY l.id_liga, l.nombre, p.nombre, l.temporada, l.fecha_inicio, l.fecha_fin, l.activo
    ORDER BY l.nombre
  `,

  /**
   * partidos_por_liga
   *
   * Parámetros:
   * - `id_liga`: id de la liga a consultar.
   *
   * Devuelve los partidos programados o realizados de la liga, con detalles del
   * estadio, jornada y resultado (si existe). Incluye `resultado` calculado
   * por comparación de goles.
   */
  partidos_por_liga: (params) => `
    -- Detalles de partidos en una liga específica
    SELECT 
      p.id_partido,
      el.nombre AS equipo_local,
      ev.nombre AS equipo_visitante,
      p.fecha_hora,
      e.nombre AS estado,
      est.nombre AS estadio,
      p.jornada,
      r.goles_local,
      r.goles_visitante,
      -- Determina el ganador basado en goles
      CASE 
        WHEN r.goles_local > r.goles_visitante THEN el.nombre
        WHEN r.goles_visitante > r.goles_local THEN ev.nombre
        WHEN r.goles_local = r.goles_visitante THEN 'Empate'
        ELSE 'Sin resultado'
      END AS resultado
    FROM Partido p
    JOIN Equipo el ON p.id_equipo_local = el.id_equipo
    JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN Estado e ON p.id_estado = e.id_estado
    LEFT JOIN Estadio est ON p.id_estadio = est.id_estadio
    LEFT JOIN Resultado r ON p.id_partido = r.id_partido
    WHERE p.id_liga = ${params.id_liga}
    ORDER BY p.fecha_hora DESC
  `,

  // ==================== CONSULTAS INTERMEDIAS ====================
  
  /**
   * apuestas_por_estado
   *
   * Parámetros:
   * - `estado`: nombre del estado (ej. 'Ganada', 'Perdida', 'Pendiente').
   *
   * Agrega y promedia métricas clave por estado de apuestas (conteo, montos,
   * min/max y total de ganancias cuando el estado es 'Ganada').
   */
  apuestas_por_estado: (params) => `
    -- Resumen estadístico de apuestas por estado
    SELECT 
      COUNT(*) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
      AVG(a.monto_apostado) AS monto_promedio,
      -- Calcula ganancias solo para apuestas ganadas
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganancias,
      MIN(a.monto_apostado) AS apuesta_minima,
      MAX(a.monto_apostado) AS apuesta_maxima
    FROM Apuesta a
    JOIN Estado e ON a.id_estado = e.id_estado
    WHERE e.nombre = '${params.estado}'
  `,

  /**
   * top_apostadores
   *
   * Parámetros:
   * - `limite`: límite de resultados/top N.
   *
   * Genera un ranking de apostadores por monto total apostado. Incluye datos
   * agregados de apuestas y ganancias/pérdidas; puede resultar útil para
   * identificar clientes de mayor valor o riesgo.
   */
  top_apostadores: (params) => `
    -- Ranking de apostadores por volumen de apuestas
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
      -- Separa ganancias y pérdidas
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganado,
      SUM(CASE WHEN e.codigo = 'PERDIDA' THEN a.monto_apostado ELSE 0 END) AS total_perdido,
      ap.saldo_actual
    FROM Apostador ap
    JOIN Usuario u ON ap.id_usuario = u.id_usuario
    LEFT JOIN Apuesta a ON ap.id_apostador = a.id_apostador
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    GROUP BY ap.id_apostador, u.username, u.nombre, u.apellido, ap.saldo_actual
    ORDER BY monto_total_apostado DESC
    LIMIT ${params.limite}
  `,

  /**
   * partidos_con_resultados
   *
   * Parámetros:
   * - `fecha_inicio`: fecha ISO de inicio para el rango.
   * - `fecha_fin`: fecha ISO de fin para el rango.
   *
   * Retorna partidos con resultados dentro de un rango de fechas, además de
   * estadísticas de tarjetas, córners y el estadio asociado.
   */
  partidos_con_resultados: (params) => `
    -- Resultados detallados de partidos en rango de fechas
    SELECT 
      p.id_partido,
      el.nombre AS equipo_local,
      ev.nombre AS equipo_visitante,
      p.fecha_hora,
      l.nombre AS liga,
      r.goles_local,
      r.goles_visitante,
      -- Determina ganador
      CASE 
        WHEN r.goles_local > r.goles_visitante THEN el.nombre
        WHEN r.goles_visitante > r.goles_local THEN ev.nombre
        ELSE 'Empate'
      END AS ganador,
      -- Suma estadísticas totales
      r.tarjetas_amarillas_local + r.tarjetas_amarillas_visitante AS total_tarjetas_amarillas,
      r.tarjetas_rojas_local + r.tarjetas_rojas_visitante AS total_tarjetas_rojas,
      r.corners_local + r.corners_visitante AS total_corners,
      est.nombre AS estadio
    FROM Partido p
    JOIN Equipo el ON p.id_equipo_local = el.id_equipo
    JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN Liga l ON p.id_liga = l.id_liga
    JOIN Resultado r ON p.id_partido = r.id_partido
    LEFT JOIN Estadio est ON p.id_estadio = est.id_estadio
    WHERE p.fecha_hora BETWEEN '${params.fecha_inicio}' AND '${params.fecha_fin}'
    ORDER BY p.fecha_hora DESC
  `,

  /**
   * transacciones_por_tipo
   *
   * Parámetros:
   * - `tipo`: código del tipo de transacción (por ejemplo, 'DEPOSITO').
   *
   * Resume transacciones completadas por tipo: conteo, sumas, comisiones y
   * métricas básicas.
   */
  transacciones_por_tipo: (params) => `
    -- Resumen financiero por tipo de transacción
    SELECT 
      COUNT(*) AS total_transacciones,
      SUM(t.monto) AS monto_total,
      SUM(t.comision) AS comision_total,
      SUM(t.monto_neto) AS monto_neto_total,
      AVG(t.monto) AS monto_promedio,
      MIN(t.monto) AS monto_minimo,
      MAX(t.monto) AS monto_maximo
    FROM Transaccion t
    JOIN TipoTransaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
    JOIN Estado e ON t.id_estado = e.id_estado
    WHERE tt.codigo = '${params.tipo}'
      AND e.codigo = 'COMPLETADA'
  `,

  /**
   * apuestas_por_deporte
   *
   * Parámetros:
   * - `id_deporte`: id del deporte a consultar.
   *
   * Agrupa estadísticas de apuestas por deporte: total, monto, margen de la
   * casa y número de apostadores únicos.
   */
  apuestas_por_deporte: (params) => `
    -- Métricas de apuestas agrupadas por deporte
    SELECT 
      d.nombre AS deporte,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_pagado,
      -- Calcula margen de la casa (apostado - pagado)
      SUM(a.monto_apostado) - SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS margen_casa,
      AVG(a.monto_apostado) AS apuesta_promedio,
      COUNT(DISTINCT a.id_apostador) AS apostadores_unicos
    FROM Apuesta a
    JOIN Cuota c ON a.id_cuota = c.id_cuota
    JOIN Partido p ON c.id_partido = p.id_partido
    JOIN Liga l ON p.id_liga = l.id_liga
    JOIN Deporte d ON l.id_deporte = d.id_deporte
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    WHERE d.id_deporte = ${params.id_deporte}
    GROUP BY d.id_deporte, d.nombre
  `,

  // ==================== CONSULTAS AVANZADAS ====================
  
  /**
   * rentabilidad_apostadores
   *
   * Parámetros:
   * - `fecha_inicio` y `fecha_fin`: rango temporal ISO.
   *
   * Analiza la rentabilidad por apostador en un rango de fechas: total
   * apostado/ganado/perdido, balance neto y porcentaje de rentabilidad (se
   * excluyen apostadores sin apuestas en el rango).
   */
  rentabilidad_apostadores: (params) => `
    -- Análisis de rentabilidad por apostador
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganado,
      SUM(CASE WHEN e.codigo = 'PERDIDA' THEN a.monto_apostado ELSE 0 END) AS total_perdido,
      -- Balance neto (ganado - apostado)
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) - 
        SUM(a.monto_apostado) AS balance,
      -- Porcentaje de retorno sobre inversión (ROI)
      ROUND(
        (SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) - 
         SUM(a.monto_apostado)) * 100.0 / 
        NULLIF(SUM(a.monto_apostado), 0), 
        2
      ) AS rentabilidad_porcentaje,
      COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) AS apuestas_ganadas,
      COUNT(CASE WHEN e.codigo = 'PERDIDA' THEN 1 END) AS apuestas_perdidas,
      -- Tasa de éxito (ganadas / total resueltas)
      ROUND(
        COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN e.codigo IN ('GANADA', 'PERDIDA') THEN 1 END), 0),
        2
      ) AS tasa_exito_porcentaje,
      ap.saldo_actual
    FROM Apostador ap
    JOIN Usuario u ON ap.id_usuario = u.id_usuario
    -- Filtra apuestas en el rango de fechas
    LEFT JOIN Apuesta a ON ap.id_apostador = a.id_apostador 
      AND a.fecha_apuesta BETWEEN '${params.fecha_inicio}' AND '${params.fecha_fin}'
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    GROUP BY ap.id_apostador, u.username, u.nombre, u.apellido, ap.saldo_actual
    HAVING COUNT(a.id_apuesta) > 0
    ORDER BY rentabilidad_porcentaje DESC
  `,

  /**
   * analisis_flujo_efectivo
   *
   * Parámetros:
   * - `anio`: año (ej. 2024).
   *
   * Agrupa transacciones por mes y calcula ingresos/egresos, balance neto,
   * usuarios activos, total de transacciones y comisiones, además de un ratio
   * ingresos/egresos.
   */
  analisis_flujo_efectivo: (params) => `
    -- CTE para agregar flujos por mes
    WITH FlujoPorMes AS (
      SELECT 
        EXTRACT(MONTH FROM t.fecha_transaccion) AS mes,
        TO_CHAR(t.fecha_transaccion, 'Month') AS nombre_mes,
        -- Suma ingresos y egresos según tipo de transacción
        SUM(CASE WHEN tt.afecta_saldo = 'suma' THEN t.monto_neto ELSE 0 END) AS ingresos,
        SUM(CASE WHEN tt.afecta_saldo = 'resta' THEN t.monto_neto ELSE 0 END) AS egresos,
        SUM(CASE WHEN tt.afecta_saldo = 'suma' THEN t.monto_neto ELSE 0 END) - 
          SUM(CASE WHEN tt.afecta_saldo = 'resta' THEN t.monto_neto ELSE 0 END) AS balance_neto,
        COUNT(DISTINCT t.id_apostador) AS usuarios_activos,
        COUNT(t.id_transaccion) AS total_transacciones,
        SUM(t.comision) AS comisiones_totales
      FROM Transaccion t
      JOIN TipoTransaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
      JOIN Estado e ON t.id_estado = e.id_estado
      WHERE EXTRACT(YEAR FROM t.fecha_transaccion) = ${params.anio}
        AND e.codigo = 'COMPLETADA'
      GROUP BY EXTRACT(MONTH FROM t.fecha_transaccion), TO_CHAR(t.fecha_transaccion, 'Month')
    )
    -- Selección final con cálculo de ratio
    SELECT 
      mes,
      TRIM(nombre_mes) AS nombre_mes,
      ingresos,
      egresos,
      balance_neto,
      usuarios_activos,
      total_transacciones,
      comisiones_totales,
      ROUND(ingresos * 100.0 / NULLIF(egresos, 0), 2) AS ratio_ingresos_egresos
    FROM FlujoPorMes
    ORDER BY mes
  `,

  /**
   * rendimiento_por_liga
   *
   * Parámetros:
   * - `id_liga`, `fecha_inicio`, `fecha_fin` (fecha_inicio/fecha_fin opcionales
   * para limitar el periodo en estadísticas).
   *
   * Devuelve métricas agregadas por liga: conteo de partidos/apuestas, totales,
   * margen y promedio de cuota para el rango especificado.
   */
  rendimiento_por_liga: (params) => `
    -- Métricas de rendimiento financiero por liga
    SELECT 
      l.nombre AS liga,
      COUNT(DISTINCT p.id_partido) AS partidos_totales,
      COUNT(DISTINCT a.id_apuesta) AS apuestas_totales,
      SUM(a.monto_apostado) AS total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_pagado,
      -- Margen de ganancia de la casa
      SUM(a.monto_apostado) - SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS margen_ganancia,
      ROUND(
        (SUM(a.monto_apostado) - SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END)) * 100.0 / 
        NULLIF(SUM(a.monto_apostado), 0),
        2
      ) AS margen_porcentaje,
      AVG(c.valor_cuota) AS cuota_promedio,
      COUNT(DISTINCT a.id_apostador) AS apostadores_unicos
    FROM Liga l
    JOIN Partido p ON l.id_liga = p.id_liga
    JOIN Cuota c ON p.id_partido = c.id_partido
    LEFT JOIN Apuesta a ON c.id_cuota = a.id_cuota
      AND a.fecha_apuesta BETWEEN '${params.fecha_inicio}' AND '${params.fecha_fin}'
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    WHERE l.id_liga = ${params.id_liga}
    GROUP BY l.id_liga, l.nombre
  `,

  /**
   * patron_apuestas_usuario
   *
   * Parámetros:
   * - `limite`: limita la cantidad de apostadores a retornar (Top N).
   *
   * Analiza patrones de usuario: deportes favoritos, horas promedio de apuesta,
   * categorías preferidas, volúmenes y tasa de éxito.
   */
  patron_apuestas_usuario: (params) => `
    -- Análisis de comportamiento de apuestas por usuario
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      -- Agrega deportes y categorías preferidas
      STRING_AGG(DISTINCT d.nombre, ', ') AS deportes_favoritos,
      ROUND(AVG(EXTRACT(HOUR FROM a.fecha_apuesta)), 2) AS hora_promedio_apuesta,
      STRING_AGG(DISTINCT ta.categoria, ', ') AS categorias_preferidas,
      SUM(a.monto_apostado) AS monto_total,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganado,
      -- Tasa de éxito del usuario
      ROUND(
        COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN e.codigo IN ('GANADA', 'PERDIDA') THEN 1 END), 0),
        2
      ) AS tasa_exito,
      ap.saldo_actual
    FROM Apostador ap
    JOIN Usuario u ON ap.id_usuario = u.id_usuario
    LEFT JOIN Apuesta a ON ap.id_apostador = a.id_apostador
    LEFT JOIN Cuota c ON a.id_cuota = c.id_cuota
    LEFT JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
    LEFT JOIN Partido p ON c.id_partido = p.id_partido
    LEFT JOIN Liga l ON p.id_liga = l.id_liga
    LEFT JOIN Deporte d ON l.id_deporte = d.id_deporte
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    GROUP BY ap.id_apostador, u.username, u.nombre, u.apellido, ap.saldo_actual
    HAVING COUNT(a.id_apuesta) > 0
    ORDER BY total_apuestas DESC
    LIMIT ${params.limite}
  `,

  /**
   * efectividad_cuotas
   *
   * Parámetros:
   * - `id_deporte`: id del deporte a consultar.
   *
   * Calcula métricas de efectividad por tipo de apuesta y cuota: tasas de acierto,
   * promedio de cuota, volumen apostado y margen para la casa.
   */
  efectividad_cuotas: (params) => `
    -- Análisis de efectividad de cuotas por tipo de apuesta
    SELECT 
      ta.nombre AS tipo_apuesta,
      ta.categoria,
      COUNT(a.id_apuesta) AS total_apuestas,
      AVG(c.valor_cuota) AS cuota_promedio,
      COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) AS apuestas_ganadas,
      COUNT(CASE WHEN e.codigo = 'PERDIDA' THEN 1 END) AS apuestas_perdidas,
      -- Tasa de acierto real vs probabilidad implícita
      ROUND(
        COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN e.codigo IN ('GANADA', 'PERDIDA') THEN 1 END), 0),
        2
      ) AS tasa_acierto_real,
      ROUND(100.0 / AVG(c.valor_cuota), 2) AS probabilidad_implicita,
      SUM(a.monto_apostado) AS volumen_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) - SUM(a.monto_apostado) AS margen_casa
    FROM TipoApuesta ta
    JOIN Cuota c ON ta.id_tipo_apuesta = c.id_tipo_apuesta
    JOIN Partido p ON c.id_partido = p.id_partido
    JOIN Liga l ON p.id_liga = l.id_liga
    LEFT JOIN Apuesta a ON c.id_cuota = a.id_cuota
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    WHERE l.id_deporte = ${params.id_deporte}
    GROUP BY ta.id_tipo_apuesta, ta.nombre, ta.categoria
    HAVING COUNT(a.id_apuesta) > 0
    ORDER BY total_apuestas DESC
  `,
};

/**
 * ejecutarReporteSQL
 *
 * Ejecuta una consulta SQL mapeada por `reporteId` usando los parámetros
 * provistos en `parametros`. Retorna el resultado en la estructura `ReporteResultado`.
 *
 * Notas de seguridad y validación:
 * - Actualmente la implementación construye queries mediante interpolación de
 *   strings (plantillas backticks) usando `params` sin sanitizarlos. Esto expone
 *   a inyección SQL si los valores de `parametros` provienen de clientes.
 * - Recomendación: cambiar la implementación a consultas parametrizadas usando
 *   `db.query('SELECT ... WHERE id = $1', [param])` o utilidades del driver que
 *   ofrezcan binding de parámetros.
 * - Validar tipos y rangos de entrada (ej. números, fechas) antes de construir la consulta.
 *
 * @param reporteId - Identificador del reporte declarado en `reportesSQL`.
 * @param parametros - Mapa de parámetros (string -> string) que el mapeo espera.
 * @returns Un objeto `ReporteResultado` con `columns` y `rows`.
 * @throws Error si el reporte no existe o la ejecución falla.
 */
export const ejecutarReporteSQL = async (
  reporteId: string,
  parametros: Record<string, string>
): Promise<ReporteResultado> => {
  const reporteQuery = reportesSQL[reporteId];

  if (!reporteQuery) {
    throw new Error(`Reporte no encontrado: ${reporteId}`);
  }

  try {
    // Generar la consulta SQL con los parámetros (actualmente interpolada)
    const query = reporteQuery(parametros);

    // ADVERTENCIA: El uso de `db.query(query)` con query interpolada es vulnerable
    // a inyección SQL si los parámetros no han sido sanitizados adecuadamente.
    // Implementar consultas parametrizadas cuando sea posible.
    const result = await db.query(query);

    // Extraer nombres de columnas
    const columns = result.fields.map((field: { name: string }) => field.name);

    // Retornar resultado formateado
    return {
      columns,
      rows: result.rows,
    };
  } catch (error) {
    console.error(`Error ejecutando reporte ${reporteId}:`, error);
    throw new Error(`Error al ejecutar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};
