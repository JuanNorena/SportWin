-- ============================================
-- DATOS DE EJEMPLO: PARTIDOS Y CUOTAS
-- ============================================

-- Verificar que existen deportes, ligas y equipos
-- Si no existen, insertarlos primero

-- Insertar partidos de fútbol programados para próximas fechas
DO $$
DECLARE
    v_id_partido_1 INTEGER;
    v_id_partido_2 INTEGER;
    v_id_partido_3 INTEGER;
    v_id_estado_programado INTEGER;
    v_id_tipo_apuesta_resultado INTEGER;
    v_id_tipo_apuesta_goles INTEGER;
BEGIN
    -- Obtener el ID del estado "Programado"
    SELECT id_estado INTO v_id_estado_programado
    FROM Estado 
    WHERE entidad = 'PARTIDO' AND codigo = 'PROGRAMADO'
    LIMIT 1;
    
    -- Si no existe, crearlo
    IF v_id_estado_programado IS NULL THEN
        INSERT INTO Estado (entidad, nombre, codigo, descripcion, activo)
        VALUES ('PARTIDO', 'Programado', 'PROGRAMADO', 'Partido programado', TRUE)
        RETURNING id_estado INTO v_id_estado_programado;
    END IF;
    
    -- Obtener tipos de apuesta
    SELECT id_tipo_apuesta INTO v_id_tipo_apuesta_resultado
    FROM TipoApuesta 
    WHERE codigo = 'RESULTADO'
    LIMIT 1;
    
    IF v_id_tipo_apuesta_resultado IS NULL THEN
        INSERT INTO TipoApuesta (codigo, nombre, descripcion, categoria, activo)
        VALUES ('RESULTADO', 'Resultado del Partido', 'Apuesta al resultado final del partido', 'PRINCIPAL', TRUE)
        RETURNING id_tipo_apuesta INTO v_id_tipo_apuesta_resultado;
    END IF;
    
    SELECT id_tipo_apuesta INTO v_id_tipo_apuesta_goles
    FROM TipoApuesta 
    WHERE codigo = 'GOLES'
    LIMIT 1;
    
    IF v_id_tipo_apuesta_goles IS NULL THEN
        INSERT INTO TipoApuesta (codigo, nombre, descripcion, categoria, activo)
        VALUES ('GOLES', 'Total de Goles', 'Apuesta al total de goles del partido', 'ESPECIAL', TRUE)
        RETURNING id_tipo_apuesta INTO v_id_tipo_apuesta_goles;
    END IF;
    
    -- Insertar Partido 1: Real Madrid vs Barcelona (próximo fin de semana)
    INSERT INTO Partido (
        id_liga, 
        id_equipo_local, 
        id_equipo_visitante, 
        fecha_hora, 
        jornada, 
        id_estado
    ) VALUES (
        1,  -- Liga La Liga (debes tener al menos 1 liga)
        1,  -- Real Madrid (debes tener al menos 2 equipos)
        2,  -- Barcelona
        CURRENT_DATE + INTERVAL '3 days' + INTERVAL '15 hours',  -- 3 días desde hoy a las 15:00
        10,
        v_id_estado_programado
    ) RETURNING id_partido INTO v_id_partido_1;
    
    -- Cuotas para Partido 1
    -- Resultado Final
    INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
    VALUES 
        (v_id_partido_1, v_id_tipo_apuesta_resultado, 'Gana Real Madrid', 2.10, 'LOCAL', TRUE),
        (v_id_partido_1, v_id_tipo_apuesta_resultado, 'Empate', 3.50, 'EMPATE', TRUE),
        (v_id_partido_1, v_id_tipo_apuesta_resultado, 'Gana Barcelona', 3.20, 'VISITANTE', TRUE);
    
    -- Total de Goles
    INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
    VALUES 
        (v_id_partido_1, v_id_tipo_apuesta_goles, 'Más de 2.5 goles', 1.85, 'OVER_2.5', TRUE),
        (v_id_partido_1, v_id_tipo_apuesta_goles, 'Menos de 2.5 goles', 2.00, 'UNDER_2.5', TRUE);
    
    -- Insertar Partido 2: Manchester City vs Liverpool (5 días desde hoy)
    INSERT INTO Partido (
        id_liga, 
        id_equipo_local, 
        id_equipo_visitante, 
        fecha_hora, 
        jornada, 
        id_estado
    ) VALUES (
        1,
        3,  -- Manchester City
        4,  -- Liverpool
        CURRENT_DATE + INTERVAL '5 days' + INTERVAL '17 hours',
        10,
        v_id_estado_programado
    ) RETURNING id_partido INTO v_id_partido_2;
    
    -- Cuotas para Partido 2
    INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
    VALUES 
        (v_id_partido_2, v_id_tipo_apuesta_resultado, 'Gana Manchester City', 1.90, 'LOCAL', TRUE),
        (v_id_partido_2, v_id_tipo_apuesta_resultado, 'Empate', 3.80, 'EMPATE', TRUE),
        (v_id_partido_2, v_id_tipo_apuesta_resultado, 'Gana Liverpool', 4.00, 'VISITANTE', TRUE),
        (v_id_partido_2, v_id_tipo_apuesta_goles, 'Más de 2.5 goles', 1.70, 'OVER_2.5', TRUE),
        (v_id_partido_2, v_id_tipo_apuesta_goles, 'Menos de 2.5 goles', 2.15, 'UNDER_2.5', TRUE);
    
    -- Insertar Partido 3: Bayern Munich vs Borussia Dortmund (7 días desde hoy)
    INSERT INTO Partido (
        id_liga, 
        id_equipo_local, 
        id_equipo_visitante, 
        fecha_hora, 
        jornada, 
        id_estado
    ) VALUES (
        1,
        5,  -- Bayern Munich
        6,  -- Borussia Dortmund
        CURRENT_DATE + INTERVAL '7 days' + INTERVAL '14 hours' + INTERVAL '30 minutes',
        10,
        v_id_estado_programado
    ) RETURNING id_partido INTO v_id_partido_3;
    
    -- Cuotas para Partido 3
    INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
    VALUES 
        (v_id_partido_3, v_id_tipo_apuesta_resultado, 'Gana Bayern Munich', 1.75, 'LOCAL', TRUE),
        (v_id_partido_3, v_id_tipo_apuesta_resultado, 'Empate', 3.90, 'EMPATE', TRUE),
        (v_id_partido_3, v_id_tipo_apuesta_resultado, 'Gana Borussia Dortmund', 4.50, 'VISITANTE', TRUE),
        (v_id_partido_3, v_id_tipo_apuesta_goles, 'Más de 2.5 goles', 1.65, 'OVER_2.5', TRUE),
        (v_id_partido_3, v_id_tipo_apuesta_goles, 'Menos de 2.5 goles', 2.25, 'UNDER_2.5', TRUE);
    
    RAISE NOTICE 'Se insertaron 3 partidos con sus respectivas cuotas';
    RAISE NOTICE 'Partido 1 ID: %, Partido 2 ID: %, Partido 3 ID: %', v_id_partido_1, v_id_partido_2, v_id_partido_3;
END $$;

-- Verificar inserción
SELECT 
    p.id_partido,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    p.fecha_hora,
    e.nombre AS estado,
    COUNT(c.id_cuota) AS total_cuotas
FROM Partido p
INNER JOIN Equipo el ON p.id_equipo_local = el.id_equipo
INNER JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
INNER JOIN Estado e ON p.id_estado = e.id_estado
LEFT JOIN Cuota c ON p.id_partido = c.id_partido
GROUP BY p.id_partido, el.nombre, ev.nombre, p.fecha_hora, e.nombre
ORDER BY p.fecha_hora;
