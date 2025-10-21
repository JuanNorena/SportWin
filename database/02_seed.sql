-- ============================================
-- SISTEMA DE APUESTAS DEPORTIVAS - SPORTWIN
-- Script de Datos de Prueba (Seed Data)
-- Base de Datos: PostgreSQL
-- ============================================

-- ============================================
-- INSERTAR USUARIOS
-- ============================================
-- Contraseña para todos: "password123" (hasheada con bcrypt)
-- Hash: $2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z

INSERT INTO Usuario (username, password_hash, nombre, apellido, email, rol, activo) VALUES
('admin', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Carlos', 'Administrador', 'admin@sportwin.com', 'admin', TRUE),
('operador1', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Maria', 'Lopez', 'maria.lopez@sportwin.com', 'operador', TRUE),
('jperez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Juan', 'Perez', 'juan.perez@email.com', 'apostador', TRUE),
('amartinez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Ana', 'Martinez', 'ana.martinez@email.com', 'apostador', TRUE),
('lgomez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Luis', 'Gomez', 'luis.gomez@email.com', 'apostador', TRUE),
('mrodriguez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Monica', 'Rodriguez', 'monica.rodriguez@email.com', 'apostador', TRUE),
('pgarcia', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Pedro', 'Garcia', 'pedro.garcia@email.com', 'apostador', TRUE),
('lhernandez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Laura', 'Hernandez', 'laura.hernandez@email.com', 'apostador', TRUE),
('cdiaz', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Carlos', 'Diaz', 'carlos.diaz@email.com', 'apostador', TRUE),
('scastro', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Sofia', 'Castro', 'sofia.castro@email.com', 'apostador', TRUE);

-- ============================================
-- INSERTAR MÉTODOS DE PAGO
-- ============================================

INSERT INTO MetodoPago (nombre, descripcion, comision, activo) VALUES
('Tarjeta de Crédito', 'Visa, Mastercard, American Express', 2.50, TRUE),
('Tarjeta de Débito', 'Débito bancario', 1.50, TRUE),
('Transferencia Bancaria', 'Transferencia desde cuenta bancaria', 0.00, TRUE),
('PSE', 'Pagos Seguros en Línea', 1.00, TRUE),
('Efectivo', 'Pago en puntos físicos', 0.00, TRUE),
('Billetera Digital', 'Nequi, Daviplata, etc.', 0.50, TRUE);

-- ============================================
-- INSERTAR APOSTADORES
-- ============================================

INSERT INTO Apostador (id_usuario, documento, tipo_documento, telefono, direccion, ciudad, pais, fecha_nacimiento, saldo_actual, verificado) VALUES
(3, '1234567890', 'CC', '3001234567', 'Calle 123 #45-67', 'Bogotá', 'Colombia', '1990-05-15', 500000.00, TRUE),
(4, '0987654321', 'CC', '3109876543', 'Carrera 45 #12-34', 'Medellín', 'Colombia', '1988-08-22', 750000.00, TRUE),
(5, '1122334455', 'CC', '3201122334', 'Avenida 68 #23-45', 'Cali', 'Colombia', '1992-03-10', 300000.00, TRUE),
(6, '5544332211', 'CE', '3105544332', 'Calle 80 #45-12', 'Barranquilla', 'Colombia', '1995-11-30', 450000.00, TRUE),
(7, '6677889900', 'CC', '3156677889', 'Carrera 7 #34-56', 'Bogotá', 'Colombia', '1987-07-18', 1200000.00, TRUE),
(8, '9988776655', 'CC', '3209988776', 'Calle 100 #15-20', 'Medellín', 'Colombia', '1993-02-25', 600000.00, TRUE),
(9, '1357924680', 'TI', '3101357924', 'Avenida 15 #78-90', 'Cali', 'Colombia', '1998-09-05', 200000.00, FALSE),
(10, '2468013579', 'Pasaporte', '3152468013', 'Calle 50 #25-30', 'Cartagena', 'Colombia', '1991-12-12', 850000.00, TRUE);

-- ============================================
-- INSERTAR DEPORTES
-- ============================================

INSERT INTO Deporte (nombre, descripcion, icono, activo) VALUES
('Fútbol', 'Deporte rey con millones de seguidores', '⚽', TRUE),
('Baloncesto', 'Deporte de canasta con gran popularidad', '🏀', TRUE),
('Tenis', 'Deporte individual o de parejas', '🎾', TRUE),
('Béisbol', 'Deporte popular en América', '⚾', TRUE),
('Fútbol Americano', 'Deporte de contacto muy popular en USA', '🏈', TRUE);

-- ============================================
-- INSERTAR LIGAS
-- ============================================

INSERT INTO Liga (id_deporte, nombre, pais, temporada, fecha_inicio, fecha_fin, activo) VALUES
(1, 'Liga BetPlay', 'Colombia', '2024', '2024-01-15', '2024-12-15', TRUE),
(1, 'Premier League', 'Inglaterra', '2024-2025', '2024-08-10', '2025-05-25', TRUE),
(1, 'La Liga', 'España', '2024-2025', '2024-08-15', '2025-05-30', TRUE),
(1, 'Copa Libertadores', 'Sudamérica', '2024', '2024-02-01', '2024-11-30', TRUE),
(2, 'NBA', 'Estados Unidos', '2024-2025', '2024-10-22', '2025-06-15', TRUE),
(3, 'ATP Tour', 'Internacional', '2024', '2024-01-01', '2024-12-31', TRUE),
(4, 'MLB', 'Estados Unidos', '2024', '2024-03-28', '2024-10-30', TRUE),
(5, 'NFL', 'Estados Unidos', '2024', '2024-09-05', '2025-02-09', TRUE);

-- ============================================
-- INSERTAR EQUIPOS
-- ============================================

INSERT INTO Equipo (id_liga, nombre, pais, ciudad, estadio, entrenador, fundacion, activo) VALUES
-- Liga BetPlay
(1, 'Atlético Nacional', 'Colombia', 'Medellín', 'Estadio Atanasio Girardot', 'Paulo Autuori', 1947, TRUE),
(1, 'Millonarios FC', 'Colombia', 'Bogotá', 'Estadio El Campín', 'Alberto Gamero', 1946, TRUE),
(1, 'América de Cali', 'Colombia', 'Cali', 'Estadio Pascual Guerrero', 'Jorge da Silva', 1927, TRUE),
(1, 'Deportivo Cali', 'Colombia', 'Cali', 'Estadio Deportivo Cali', 'Jaime de la Pava', 1912, TRUE),
-- Premier League
(2, 'Manchester City', 'Inglaterra', 'Manchester', 'Etihad Stadium', 'Pep Guardiola', 1880, TRUE),
(2, 'Liverpool FC', 'Inglaterra', 'Liverpool', 'Anfield', 'Jürgen Klopp', 1892, TRUE),
(2, 'Arsenal FC', 'Inglaterra', 'Londres', 'Emirates Stadium', 'Mikel Arteta', 1886, TRUE),
(2, 'Chelsea FC', 'Inglaterra', 'Londres', 'Stamford Bridge', 'Mauricio Pochettino', 1905, TRUE),
-- La Liga
(3, 'Real Madrid', 'España', 'Madrid', 'Santiago Bernabéu', 'Carlo Ancelotti', 1902, TRUE),
(3, 'FC Barcelona', 'España', 'Barcelona', 'Camp Nou', 'Xavi Hernández', 1899, TRUE),
(3, 'Atlético Madrid', 'España', 'Madrid', 'Cívitas Metropolitano', 'Diego Simeone', 1903, TRUE),
(3, 'Sevilla FC', 'España', 'Sevilla', 'Ramón Sánchez-Pizjuán', 'Diego Alonso', 1890, TRUE),
-- NBA
(5, 'Los Angeles Lakers', 'Estados Unidos', 'Los Angeles', 'Crypto.com Arena', 'Darvin Ham', 1947, TRUE),
(5, 'Boston Celtics', 'Estados Unidos', 'Boston', 'TD Garden', 'Joe Mazzulla', 1946, TRUE),
(5, 'Golden State Warriors', 'Estados Unidos', 'San Francisco', 'Chase Center', 'Steve Kerr', 1946, TRUE),
(5, 'Miami Heat', 'Estados Unidos', 'Miami', 'Kaseya Center', 'Erik Spoelstra', 1988, TRUE),
-- NFL
(8, 'Kansas City Chiefs', 'Estados Unidos', 'Kansas City', 'Arrowhead Stadium', 'Andy Reid', 1960, TRUE),
(8, 'San Francisco 49ers', 'Estados Unidos', 'San Francisco', 'Levis Stadium', 'Kyle Shanahan', 1946, TRUE),
(8, 'Buffalo Bills', 'Estados Unidos', 'Buffalo', 'Highmark Stadium', 'Sean McDermott', 1960, TRUE),
(8, 'Philadelphia Eagles', 'Estados Unidos', 'Philadelphia', 'Lincoln Financial Field', 'Nick Sirianni', 1933, TRUE),
-- Equipos adicionales
(4, 'Boca Juniors', 'Argentina', 'Buenos Aires', 'La Bombonera', 'Jorge Almirón', 1905, TRUE),
(4, 'River Plate', 'Argentina', 'Buenos Aires', 'Monumental', 'Martín Demichelis', 1901, TRUE);

-- ============================================
-- INSERTAR PARTIDOS
-- ============================================

INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, estadio, jornada, estado, arbitro, asistencia) VALUES
-- Liga BetPlay
(1, 1, 2, '2024-10-25 19:00:00', 'Estadio Atanasio Girardot', 15, 'programado', 'Wilmar Roldán', NULL),
(1, 3, 4, '2024-10-26 15:30:00', 'Estadio Pascual Guerrero', 15, 'programado', 'Carlos Ortega', NULL),
(1, 2, 1, '2024-10-15 20:00:00', 'Estadio El Campín', 14, 'finalizado', 'Wilmar Roldán', 35000),
-- Premier League
(2, 5, 6, '2024-10-27 14:00:00', 'Etihad Stadium', 10, 'programado', 'Michael Oliver', NULL),
(2, 7, 8, '2024-10-27 11:30:00', 'Emirates Stadium', 10, 'programado', 'Anthony Taylor', NULL),
(2, 6, 5, '2024-10-20 16:00:00', 'Anfield', 9, 'finalizado', 'Michael Oliver', 54000),
-- La Liga
(3, 9, 10, '2024-10-28 20:00:00', 'Santiago Bernabéu', 11, 'programado', 'Antonio Mateu', NULL),
(3, 11, 12, '2024-10-28 17:00:00', 'Cívitas Metropolitano', 11, 'programado', 'José María Sánchez', NULL),
(3, 10, 9, '2024-10-18 20:00:00', 'Camp Nou', 10, 'finalizado', 'Antonio Mateu', 85000),
-- NBA
(5, 13, 14, '2024-10-25 19:30:00', 'Crypto.com Arena', 5, 'programado', 'Scott Foster', NULL),
(5, 15, 16, '2024-10-26 20:00:00', 'Chase Center', 5, 'programado', 'Tony Brothers', NULL),
-- NFL
(8, 17, 18, '2024-10-27 13:00:00', 'Arrowhead Stadium', 8, 'programado', 'Clete Blakeman', NULL),
(8, 19, 20, '2024-10-27 16:25:00', 'Highmark Stadium', 8, 'programado', 'Brad Allen', NULL),
-- Copa Libertadores
(4, 21, 22, '2024-10-29 21:30:00', 'La Bombonera', 14, 'programado', 'Andrés Matonte', NULL),
(4, 22, 21, '2024-10-22 21:30:00', 'Monumental', 13, 'finalizado', 'Wilton Sampaio', 65000);

-- ============================================
-- INSERTAR RESULTADOS (para partidos finalizados)
-- ============================================

INSERT INTO Resultado (id_partido, goles_local, goles_visitante, tarjetas_amarillas_local, tarjetas_amarillas_visitante, tarjetas_rojas_local, tarjetas_rojas_visitante, corners_local, corners_visitante) VALUES
(3, 2, 1, 3, 2, 0, 1, 8, 5),
(6, 1, 1, 2, 3, 0, 0, 7, 6),
(9, 3, 2, 4, 3, 1, 0, 10, 4),
(15, 2, 2, 3, 4, 0, 0, 6, 7);

-- ============================================
-- INSERTAR TIPOS DE APUESTA
-- ============================================

INSERT INTO TipoApuesta (nombre, descripcion, categoria, activo) VALUES
('Ganador del Partido', 'Apuesta sobre qué equipo ganará el partido', 'resultado', TRUE),
('Empate', 'Apuesta a que el partido terminará empatado', 'resultado', TRUE),
('Marcador Exacto', 'Apuesta al marcador exacto del partido', 'marcador', TRUE),
('Más/Menos Goles', 'Apuesta sobre si habrá más o menos goles que la línea establecida', 'estadistica', TRUE),
('Ambos Equipos Anotan', 'Apuesta a que ambos equipos marquen gol', 'estadistica', TRUE),
('Goleador del Partido', 'Apuesta sobre qué jugador marcará gol', 'jugador', TRUE),
('Tarjetas Amarillas', 'Apuesta sobre el número de tarjetas amarillas', 'estadistica', TRUE),
('Corners', 'Apuesta sobre el número de tiros de esquina', 'estadistica', TRUE),
('Primer Tiempo/Final', 'Apuesta combinada del resultado al medio tiempo y final', 'resultado', TRUE),
('Handicap', 'Apuesta con ventaja/desventaja para un equipo', 'resultado', TRUE);

-- ============================================
-- INSERTAR CUOTAS
-- ============================================

-- Cuotas para partido 1: Nacional vs Millonarios
INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo) VALUES
(1, 1, 'Atlético Nacional gana', 2.10, 'Nacional', TRUE),
(1, 2, 'Empate', 3.20, 'Empate', TRUE),
(1, 1, 'Millonarios FC gana', 3.40, 'Millonarios', TRUE),
(1, 4, 'Más de 2.5 goles', 1.85, 'Más de 2.5', TRUE),
(1, 4, 'Menos de 2.5 goles', 1.95, 'Menos de 2.5', TRUE),
(1, 5, 'Ambos equipos anotan - Sí', 1.75, 'Sí', TRUE),

-- Cuotas para partido 2: América vs Deportivo Cali
(2, 1, 'América de Cali gana', 2.30, 'América', TRUE),
(2, 2, 'Empate', 3.00, 'Empate', TRUE),
(2, 1, 'Deportivo Cali gana', 3.10, 'Cali', TRUE),

-- Cuotas para partido 4: Manchester City vs Liverpool
(4, 1, 'Manchester City gana', 2.05, 'City', TRUE),
(4, 2, 'Empate', 3.50, 'Empate', TRUE),
(4, 1, 'Liverpool FC gana', 3.30, 'Liverpool', TRUE),
(4, 4, 'Más de 3.5 goles', 2.20, 'Más de 3.5', TRUE),

-- Cuotas para partido 7: Real Madrid vs Barcelona
(7, 1, 'Real Madrid gana', 2.25, 'Real Madrid', TRUE),
(7, 2, 'Empate', 3.10, 'Empate', TRUE),
(7, 1, 'FC Barcelona gana', 3.00, 'Barcelona', TRUE),
(7, 5, 'Ambos equipos anotan - Sí', 1.65, 'Sí', TRUE),

-- Cuotas para partido 10: Lakers vs Celtics
(10, 1, 'Los Angeles Lakers gana', 1.95, 'Lakers', TRUE),
(10, 1, 'Boston Celtics gana', 1.85, 'Celtics', TRUE),
(10, 4, 'Más de 220.5 puntos', 1.90, 'Más de 220.5', TRUE),

-- Cuotas para partido 12: Chiefs vs 49ers
(12, 1, 'Kansas City Chiefs gana', 1.80, 'Chiefs', TRUE),
(12, 1, 'San Francisco 49ers gana', 2.00, '49ers', TRUE),
(12, 4, 'Más de 45.5 puntos', 1.92, 'Más de 45.5', TRUE);

-- ============================================
-- INSERTAR APUESTAS
-- ============================================

INSERT INTO Apuesta (id_apostador, id_cuota, monto_apostado, cuota_aplicada, estado, fecha_apuesta) VALUES
-- Apuestas de Juan Perez (id_apostador = 1)
(1, 1, 50000.00, 2.10, 'pendiente', '2024-10-20 10:30:00'),
(1, 4, 30000.00, 1.85, 'pendiente', '2024-10-20 11:00:00'),
(1, 10, 25000.00, 2.05, 'pendiente', '2024-10-22 14:00:00'),

-- Apuestas de Ana Martinez (id_apostador = 2)
(2, 14, 75000.00, 2.25, 'pendiente', '2024-10-21 09:00:00'),
(2, 17, 50000.00, 1.95, 'pendiente', '2024-10-21 15:30:00'),

-- Apuestas de Luis Gomez (id_apostador = 3)
(3, 7, 40000.00, 2.30, 'pendiente', '2024-10-22 12:00:00'),
(3, 20, 35000.00, 1.80, 'pendiente', '2024-10-23 10:00:00'),

-- Apuestas de Monica Rodriguez (id_apostador = 4)
(4, 12, 60000.00, 3.30, 'pendiente', '2024-10-22 16:00:00'),

-- Apuestas de Pedro Garcia (id_apostador = 5)
(5, 6, 100000.00, 1.75, 'pendiente', '2024-10-20 18:00:00'),
(5, 13, 80000.00, 2.20, 'pendiente', '2024-10-22 11:00:00'),

-- Apuestas de Laura Hernandez (id_apostador = 6)
(6, 15, 45000.00, 3.10, 'pendiente', '2024-10-23 09:30:00'),

-- Apuestas de Carlos Diaz (id_apostador = 7) - Usuario no verificado
(7, 2, 20000.00, 3.20, 'pendiente', '2024-10-23 13:00:00'),

-- Apuestas de Sofia Castro (id_apostador = 8)
(8, 16, 90000.00, 3.00, 'pendiente', '2024-10-23 14:30:00'),
(8, 19, 70000.00, 1.85, 'pendiente', '2024-10-23 15:00:00');

-- ============================================
-- INSERTAR TRANSACCIONES
-- ============================================

-- Depósitos iniciales
INSERT INTO Transaccion (id_apostador, id_metodo_pago, tipo, monto, comision, monto_neto, estado, descripcion) VALUES
(1, 1, 'deposito', 500000.00, 12500.00, 487500.00, 'completada', 'Depósito inicial con tarjeta de crédito'),
(2, 3, 'deposito', 750000.00, 0.00, 750000.00, 'completada', 'Depósito inicial por transferencia'),
(3, 6, 'deposito', 300000.00, 1500.00, 298500.00, 'completada', 'Depósito con billetera digital'),
(4, 1, 'deposito', 450000.00, 11250.00, 438750.00, 'completada', 'Depósito con tarjeta de crédito'),
(5, 2, 'deposito', 1200000.00, 18000.00, 1182000.00, 'completada', 'Depósito con tarjeta de débito'),
(6, 4, 'deposito', 600000.00, 6000.00, 594000.00, 'completada', 'Depósito PSE'),
(7, 5, 'deposito', 200000.00, 0.00, 200000.00, 'completada', 'Depósito en efectivo'),
(8, 3, 'deposito', 850000.00, 0.00, 850000.00, 'completada', 'Depósito por transferencia');

-- Transacciones de apuestas (descontar del saldo)
INSERT INTO Transaccion (id_apostador, id_metodo_pago, id_apuesta, tipo, monto, comision, monto_neto, estado, descripcion) VALUES
(1, NULL, 1, 'apuesta', 50000.00, 0.00, 50000.00, 'completada', 'Apuesta Nacional vs Millonarios'),
(1, NULL, 2, 'apuesta', 30000.00, 0.00, 30000.00, 'completada', 'Apuesta más de 2.5 goles'),
(1, NULL, 3, 'apuesta', 25000.00, 0.00, 25000.00, 'completada', 'Apuesta Manchester City'),
(2, NULL, 4, 'apuesta', 75000.00, 0.00, 75000.00, 'completada', 'Apuesta Real Madrid vs Barcelona'),
(2, NULL, 5, 'apuesta', 50000.00, 0.00, 50000.00, 'completada', 'Apuesta Lakers'),
(3, NULL, 6, 'apuesta', 40000.00, 0.00, 40000.00, 'completada', 'Apuesta América vs Cali'),
(3, NULL, 7, 'apuesta', 35000.00, 0.00, 35000.00, 'completada', 'Apuesta Chiefs'),
(4, NULL, 8, 'apuesta', 60000.00, 0.00, 60000.00, 'completada', 'Apuesta Liverpool'),
(5, NULL, 9, 'apuesta', 100000.00, 0.00, 100000.00, 'completada', 'Apuesta ambos equipos anotan'),
(5, NULL, 10, 'apuesta', 80000.00, 0.00, 80000.00, 'completada', 'Apuesta más de 3.5 goles'),
(6, NULL, 11, 'apuesta', 45000.00, 0.00, 45000.00, 'completada', 'Apuesta empate'),
(7, NULL, 12, 'apuesta', 20000.00, 0.00, 20000.00, 'completada', 'Apuesta empate Nacional'),
(8, NULL, 13, 'apuesta', 90000.00, 0.00, 90000.00, 'completada', 'Apuesta Barcelona'),
(8, NULL, 14, 'apuesta', 70000.00, 0.00, 70000.00, 'completada', 'Apuesta Celtics');

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Mostrar resumen de datos insertados
DO $$
BEGIN
    RAISE NOTICE 'Datos insertados exitosamente:';
    RAISE NOTICE '- % usuarios', (SELECT COUNT(*) FROM Usuario);
    RAISE NOTICE '- % apostadores', (SELECT COUNT(*) FROM Apostador);
    RAISE NOTICE '- % deportes', (SELECT COUNT(*) FROM Deporte);
    RAISE NOTICE '- % ligas', (SELECT COUNT(*) FROM Liga);
    RAISE NOTICE '- % equipos', (SELECT COUNT(*) FROM Equipo);
    RAISE NOTICE '- % partidos', (SELECT COUNT(*) FROM Partido);
    RAISE NOTICE '- % resultados', (SELECT COUNT(*) FROM Resultado);
    RAISE NOTICE '- % tipos de apuesta', (SELECT COUNT(*) FROM TipoApuesta);
    RAISE NOTICE '- % cuotas', (SELECT COUNT(*) FROM Cuota);
    RAISE NOTICE '- % apuestas', (SELECT COUNT(*) FROM Apuesta);
    RAISE NOTICE '- % transacciones', (SELECT COUNT(*) FROM Transaccion);
    RAISE NOTICE '- % métodos de pago', (SELECT COUNT(*) FROM MetodoPago);
END $$;

-- ============================================
-- FIN DEL SCRIPT DE DATOS
-- ============================================
