import db from '../utils/database';

interface ReporteResultado {
  columns: string[];
  rows: Record<string, unknown>[];
}

// Mapeo de reportes a sus consultas SQL
const reportesSQL: Record<string, (params: Record<string, string>) => string> = {
  // ==================== CONSULTAS SIMPLES ====================
  
  partidos_por_mes: (params) => `
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
    JOIN Equipo el ON p.id_equipo_local = el.id_equipo
    JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
    JOIN Liga l ON p.id_liga = l.id_liga
    JOIN Estado e ON p.id_estado = e.id_estado
    LEFT JOIN Resultado r ON p.id_partido = r.id_partido
    WHERE EXTRACT(MONTH FROM p.fecha_hora) = ${params.mes}
      AND EXTRACT(YEAR FROM p.fecha_hora) = ${params.anio}
      AND e.codigo = 'FINALIZADO'
    ORDER BY p.fecha_hora DESC
  `,

  apostadores_activos: (params) => `
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
    WHERE a.saldo_actual > ${params.monto}
    ORDER BY a.saldo_actual DESC
  `,

  ligas_por_deporte: (params) => `
    SELECT 
      l.id_liga,
      l.nombre AS liga,
      p.nombre AS pais,
      l.temporada,
      l.fecha_inicio,
      l.fecha_fin,
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

  partidos_por_liga: (params) => `
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
  
  apuestas_por_estado: (params) => `
    SELECT 
      COUNT(*) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
      AVG(a.monto_apostado) AS monto_promedio,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganancias,
      MIN(a.monto_apostado) AS apuesta_minima,
      MAX(a.monto_apostado) AS apuesta_maxima
    FROM Apuesta a
    JOIN Estado e ON a.id_estado = e.id_estado
    WHERE e.nombre = '${params.estado}'
  `,

  top_apostadores: (params) => `
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
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

  partidos_con_resultados: (params) => `
    SELECT 
      p.id_partido,
      el.nombre AS equipo_local,
      ev.nombre AS equipo_visitante,
      p.fecha_hora,
      l.nombre AS liga,
      r.goles_local,
      r.goles_visitante,
      CASE 
        WHEN r.goles_local > r.goles_visitante THEN el.nombre
        WHEN r.goles_visitante > r.goles_local THEN ev.nombre
        ELSE 'Empate'
      END AS ganador,
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

  transacciones_por_tipo: (params) => `
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

  apuestas_por_deporte: (params) => `
    SELECT 
      d.nombre AS deporte,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS monto_total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_pagado,
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
  
  rentabilidad_apostadores: (params) => `
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      SUM(a.monto_apostado) AS total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganado,
      SUM(CASE WHEN e.codigo = 'PERDIDA' THEN a.monto_apostado ELSE 0 END) AS total_perdido,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) - 
        SUM(a.monto_apostado) AS balance,
      ROUND(
        (SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) - 
         SUM(a.monto_apostado)) * 100.0 / 
        NULLIF(SUM(a.monto_apostado), 0), 
        2
      ) AS rentabilidad_porcentaje,
      COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) AS apuestas_ganadas,
      COUNT(CASE WHEN e.codigo = 'PERDIDA' THEN 1 END) AS apuestas_perdidas,
      ROUND(
        COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN e.codigo IN ('GANADA', 'PERDIDA') THEN 1 END), 0),
        2
      ) AS tasa_exito_porcentaje,
      ap.saldo_actual
    FROM Apostador ap
    JOIN Usuario u ON ap.id_usuario = u.id_usuario
    LEFT JOIN Apuesta a ON ap.id_apostador = a.id_apostador 
      AND a.fecha_apuesta BETWEEN '${params.fecha_inicio}' AND '${params.fecha_fin}'
    LEFT JOIN Estado e ON a.id_estado = e.id_estado
    GROUP BY ap.id_apostador, u.username, u.nombre, u.apellido, ap.saldo_actual
    HAVING COUNT(a.id_apuesta) > 0
    ORDER BY rentabilidad_porcentaje DESC
  `,

  analisis_flujo_efectivo: (params) => `
    WITH FlujoPorMes AS (
      SELECT 
        EXTRACT(MONTH FROM t.fecha_transaccion) AS mes,
        TO_CHAR(t.fecha_transaccion, 'Month') AS nombre_mes,
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

  rendimiento_por_liga: (params) => `
    SELECT 
      l.nombre AS liga,
      COUNT(DISTINCT p.id_partido) AS partidos_totales,
      COUNT(DISTINCT a.id_apuesta) AS apuestas_totales,
      SUM(a.monto_apostado) AS total_apostado,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_pagado,
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

  patron_apuestas_usuario: (params) => `
    SELECT 
      ap.id_apostador,
      u.username,
      u.nombre || ' ' || u.apellido AS nombre_completo,
      COUNT(a.id_apuesta) AS total_apuestas,
      STRING_AGG(DISTINCT d.nombre, ', ') AS deportes_favoritos,
      ROUND(AVG(EXTRACT(HOUR FROM a.fecha_apuesta)), 2) AS hora_promedio_apuesta,
      STRING_AGG(DISTINCT ta.categoria, ', ') AS categorias_preferidas,
      SUM(a.monto_apostado) AS monto_total,
      SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) AS total_ganado,
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

  efectividad_cuotas: (params) => `
    SELECT 
      ta.nombre AS tipo_apuesta,
      ta.categoria,
      COUNT(a.id_apuesta) AS total_apuestas,
      AVG(c.valor_cuota) AS cuota_promedio,
      COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) AS apuestas_ganadas,
      COUNT(CASE WHEN e.codigo = 'PERDIDA' THEN 1 END) AS apuestas_perdidas,
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

export const ejecutarReporteSQL = async (
  reporteId: string,
  parametros: Record<string, string>
): Promise<ReporteResultado> => {
  const reporteQuery = reportesSQL[reporteId];

  if (!reporteQuery) {
    throw new Error(`Reporte no encontrado: ${reporteId}`);
  }

  try {
    // Generar la consulta SQL con los parámetros
    const query = reporteQuery(parametros);
    
    // Ejecutar la consulta
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
