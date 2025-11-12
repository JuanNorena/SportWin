-- ============================================
-- SCRIPT SIMPLIFICADO: Insertar Partidos con Datos Existentes
-- ============================================

-- Paso 1: Verificar qué equipos y ligas existen
SELECT 'LIGAS DISPONIBLES:' AS info;
SELECT id_liga, nombre, temporada FROM Liga WHERE activo = true LIMIT 10;

SELECT 'EQUIPOS DISPONIBLES:' AS info;
SELECT id_equipo, nombre FROM Equipo WHERE activo = true LIMIT 20;

SELECT 'ESTADOS DE PARTIDO:' AS info;
SELECT id_estado, codigo, nombre FROM Estado WHERE entidad = 'PARTIDO';

SELECT 'TIPOS DE APUESTA:' AS info;
SELECT id_tipo_apuesta, codigo, nombre FROM TipoApuesta WHERE activo = true;

-- Paso 2: Crear estado PROGRAMADO si no existe
INSERT INTO Estado (entidad, nombre, codigo, descripcion, activo)
SELECT 'PARTIDO', 'Programado', 'PROGRAMADO', 'Partido programado para jugar', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM Estado WHERE entidad = 'PARTIDO' AND codigo = 'PROGRAMADO'
);

-- Paso 3: Crear tipos de apuesta básicos si no existen
INSERT INTO TipoApuesta (codigo, nombre, descripcion, categoria, activo)
SELECT 'RESULTADO', 'Resultado del Partido', 'Ganador del partido (Local/Empate/Visitante)', 'PRINCIPAL', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM TipoApuesta WHERE codigo = 'RESULTADO'
);

INSERT INTO TipoApuesta (codigo, nombre, descripcion, categoria, activo)
SELECT 'GOLES', 'Total de Goles', 'Más o menos goles en el partido', 'ESPECIAL', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM TipoApuesta WHERE codigo = 'GOLES'
);

-- Paso 4: Insertar partidos usando los primeros equipos disponibles
DO $$
DECLARE
    v_id_liga INTEGER;
    v_id_equipo_1 INTEGER;
    v_id_equipo_2 INTEGER;
    v_id_equipo_3 INTEGER;
    v_id_equipo_4 INTEGER;
    v_id_equipo_5 INTEGER;
    v_id_equipo_6 INTEGER;
    v_id_estado_programado INTEGER;
    v_id_tipo_resultado INTEGER;
    v_id_tipo_goles INTEGER;
    v_id_partido_1 INTEGER;
    v_id_partido_2 INTEGER;
    v_id_partido_3 INTEGER;
BEGIN
    -- Obtener la primera liga disponible
    SELECT id_liga INTO v_id_liga FROM Liga WHERE activo = true LIMIT 1;
    
    IF v_id_liga IS NULL THEN
        RAISE EXCEPTION 'No hay ligas disponibles. Ejecuta primero el script de seed.';
    END IF;
    
    -- Obtener los primeros 6 equipos
    SELECT id_equipo INTO v_id_equipo_1 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 0;
    SELECT id_equipo INTO v_id_equipo_2 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 1;
    SELECT id_equipo INTO v_id_equipo_3 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 2;
    SELECT id_equipo INTO v_id_equipo_4 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 3;
    SELECT id_equipo INTO v_id_equipo_5 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 4;
    SELECT id_equipo INTO v_id_equipo_6 FROM Equipo WHERE activo = true ORDER BY id_equipo LIMIT 1 OFFSET 5;
    
    IF v_id_equipo_2 IS NULL THEN
        RAISE EXCEPTION 'Se necesitan al menos 2 equipos. Ejecuta primero el script de seed.';
    END IF;
    
    -- Obtener IDs de estado y tipos de apuesta
    SELECT id_estado INTO v_id_estado_programado FROM Estado WHERE entidad = 'PARTIDO' AND codigo = 'PROGRAMADO';
    SELECT id_tipo_apuesta INTO v_id_tipo_resultado FROM TipoApuesta WHERE codigo = 'RESULTADO';
    SELECT id_tipo_apuesta INTO v_id_tipo_goles FROM TipoApuesta WHERE codigo = 'GOLES';
    
    -- PARTIDO 1 (En 3 días)
    INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, jornada, id_estado)
    VALUES (
        v_id_liga,
        v_id_equipo_1,
        v_id_equipo_2,
        CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '15 hours',
        1,
        v_id_estado_programado
    ) RETURNING id_partido INTO v_id_partido_1;
    
    -- Cuotas para Partido 1
    INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
    VALUES 
        (v_id_partido_1, v_id_tipo_resultado, 'Gana Local', 2.10, 'LOCAL', TRUE),
        (v_id_partido_1, v_id_tipo_resultado, 'Empate', 3.50, 'EMPATE', TRUE),
        (v_id_partido_1, v_id_tipo_resultado, 'Gana Visitante', 3.20, 'VISITANTE', TRUE),
        (v_id_partido_1, v_id_tipo_goles, 'Más de 2.5 goles', 1.85, 'OVER_2.5', TRUE),
        (v_id_partido_1, v_id_tipo_goles, 'Menos de 2.5 goles', 2.00, 'UNDER_2.5', TRUE);
    
    -- PARTIDO 2 (En 5 días) - solo si hay al menos 4 equipos
    IF v_id_equipo_4 IS NOT NULL THEN
        INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, jornada, id_estado)
        VALUES (
            v_id_liga,
            v_id_equipo_3,
            v_id_equipo_4,
            CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '17 hours',
            1,
            v_id_estado_programado
        ) RETURNING id_partido INTO v_id_partido_2;
        
        INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
        VALUES 
            (v_id_partido_2, v_id_tipo_resultado, 'Gana Local', 1.90, 'LOCAL', TRUE),
            (v_id_partido_2, v_id_tipo_resultado, 'Empate', 3.80, 'EMPATE', TRUE),
            (v_id_partido_2, v_id_tipo_resultado, 'Gana Visitante', 4.00, 'VISITANTE', TRUE),
            (v_id_partido_2, v_id_tipo_goles, 'Más de 2.5 goles', 1.70, 'OVER_2.5', TRUE),
            (v_id_partido_2, v_id_tipo_goles, 'Menos de 2.5 goles', 2.15, 'UNDER_2.5', TRUE);
    END IF;
    
    -- PARTIDO 3 (En 7 días) - solo si hay al menos 6 equipos
    IF v_id_equipo_6 IS NOT NULL THEN
        INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, jornada, id_estado)
        VALUES (
            v_id_liga,
            v_id_equipo_5,
            v_id_equipo_6,
            CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '14 hours' + INTERVAL '30 minutes',
            1,
            v_id_estado_programado
        ) RETURNING id_partido INTO v_id_partido_3;
        
        INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo)
        VALUES 
            (v_id_partido_3, v_id_tipo_resultado, 'Gana Local', 1.75, 'LOCAL', TRUE),
            (v_id_partido_3, v_id_tipo_resultado, 'Empate', 3.90, 'EMPATE', TRUE),
            (v_id_partido_3, v_id_tipo_resultado, 'Gana Borussia Dortmund', 4.50, 'VISITANTE', TRUE),
            (v_id_partido_3, v_id_tipo_goles, 'Más de 2.5 goles', 1.65, 'OVER_2.5', TRUE),
            (v_id_partido_3, v_id_tipo_goles, 'Menos de 2.5 goles', 2.25, 'UNDER_2.5', TRUE);
    END IF;
    
    RAISE NOTICE '✅ Partidos insertados exitosamente';
END $$;

-- Verificación final
SELECT 
    p.id_partido,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    TO_CHAR(p.fecha_hora, 'DD/MM/YYYY HH24:MI') AS fecha_partido,
    e.nombre AS estado,
    COUNT(c.id_cuota) AS total_cuotas
FROM Partido p
INNER JOIN Equipo el ON p.id_equipo_local = el.id_equipo
INNER JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
INNER JOIN Estado e ON p.id_estado = e.id_estado
LEFT JOIN Cuota c ON p.id_partido = c.id_partido
WHERE p.fecha_hora > CURRENT_TIMESTAMP
GROUP BY p.id_partido, el.nombre, ev.nombre, p.fecha_hora, e.nombre
ORDER BY p.fecha_hora;
