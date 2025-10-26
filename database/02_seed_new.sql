-- ============================================
-- SISTEMA DE APUESTAS DEPORTIVAS - SPORTWIN
-- Script de Datos de Prueba (Seed Data) - ACTUALIZADO
-- Base de Datos: PostgreSQL
-- ============================================

-- ============================================
-- INSERTAR PAÍSES
-- ============================================
INSERT INTO Pais (nombre, codigo_iso, codigo_telefono, activo) VALUES
('Colombia', 'COL', '+57', TRUE),
('Argentina', 'ARG', '+54', TRUE),
('Brasil', 'BRA', '+55', TRUE),
('España', 'ESP', '+34', TRUE),
('Inglaterra', 'GBR', '+44', TRUE),
('Estados Unidos', 'USA', '+1', TRUE),
('México', 'MEX', '+52', TRUE),
('Chile', 'CHL', '+56', TRUE),
('Uruguay', 'URY', '+598', TRUE),
('Perú', 'PER', '+51', TRUE);

-- ============================================
-- INSERTAR ESTADOS/DEPARTAMENTOS
-- ============================================
INSERT INTO Departamento (id_pais, nombre, codigo, activo) VALUES
-- Colombia
(1, 'Antioquia', 'ANT', TRUE),
(1, 'Cundinamarca', 'CUN', TRUE),
(1, 'Valle del Cauca', 'VAC', TRUE),
(1, 'Atlántico', 'ATL', TRUE),
(1, 'Bolívar', 'BOL', TRUE),
-- Argentina
(2, 'Buenos Aires', 'BA', TRUE),
(2, 'Córdoba', 'CBA', TRUE),
-- España
(4, 'Madrid', 'MAD', TRUE),
(4, 'Cataluña', 'CAT', TRUE),
(4, 'Andalucía', 'AND', TRUE),
-- Inglaterra
(5, 'Greater London', 'LND', TRUE),
(5, 'Greater Manchester', 'MAN', TRUE),
(5, 'Merseyside', 'MER', TRUE),
-- Estados Unidos
(6, 'California', 'CA', TRUE),
(6, 'New York', 'NY', TRUE),
(6, 'Florida', 'FL', TRUE),
(6, 'Missouri', 'MO', TRUE),
(6, 'Massachusetts', 'MA', TRUE);

-- ============================================
-- INSERTAR CIUDADES
-- ============================================
INSERT INTO Ciudad (id_departamento, nombre, codigo_postal, activo) VALUES
-- Colombia
(1, 'Medellín', '050001', TRUE),
(2, 'Bogotá', '110111', TRUE),
(3, 'Cali', '760001', TRUE),
(4, 'Barranquilla', '080001', TRUE),
(5, 'Cartagena', '130001', TRUE),
-- Argentina
(6, 'Buenos Aires', 'C1000', TRUE),
(7, 'Córdoba', 'X5000', TRUE),
-- España
(8, 'Madrid', '28001', TRUE),
(9, 'Barcelona', '08001', TRUE),
(10, 'Sevilla', '41001', TRUE),
-- Inglaterra
(11, 'Londres', 'E1', TRUE),
(12, 'Manchester', 'M1', TRUE),
(13, 'Liverpool', 'L1', TRUE),
-- Estados Unidos
(14, 'Los Angeles', '90001', TRUE),
(14, 'San Francisco', '94102', TRUE),
(15, 'Boston', '02101', TRUE),
(16, 'Miami', '33101', TRUE),
(17, 'Kansas City', '64101', TRUE),
(18, 'Buffalo', '14201', TRUE),
(18, 'Philadelphia', '19019', TRUE);

-- ============================================
-- INSERTAR ROLES
-- ============================================
INSERT INTO Rol (nombre, descripcion, permisos, activo) VALUES
('admin', 'Administrador del sistema', 'all', TRUE),
('operador', 'Operador de apuestas', 'read,create,update', TRUE),
('apostador', 'Cliente apostador', 'read,create', TRUE);

-- ============================================
-- INSERTAR TIPOS DE DOCUMENTO
-- ============================================
INSERT INTO TipoDocumento (nombre, codigo, descripcion, activo) VALUES
('Cédula de Ciudadanía', 'CC', 'Documento de identidad colombiano', TRUE),
('Cédula de Extranjería', 'CE', 'Documento para extranjeros en Colombia', TRUE),
('Tarjeta de Identidad', 'TI', 'Documento para menores de edad', TRUE),
('Pasaporte', 'PA', 'Documento internacional', TRUE),
('DNI', 'DNI', 'Documento Nacional de Identidad', TRUE);

-- ============================================
-- INSERTAR TIPOS DE TRANSACCIÓN
-- ============================================
INSERT INTO TipoTransaccion (nombre, codigo, descripcion, afecta_saldo, activo) VALUES
('Depósito', 'DEPOSITO', 'Ingreso de dinero a la cuenta', 'suma', TRUE),
('Retiro', 'RETIRO', 'Retiro de dinero de la cuenta', 'resta', TRUE),
('Apuesta', 'APUESTA', 'Pago por realizar una apuesta', 'resta', TRUE),
('Ganancia', 'GANANCIA', 'Ganancia de una apuesta', 'suma', TRUE),
('Reembolso', 'REEMBOLSO', 'Devolución de dinero', 'suma', TRUE),
('Comisión', 'COMISION', 'Cobro de comisión', 'resta', TRUE);

-- ============================================
-- INSERTAR ESTADOS (Tabla genérica para Partido, Apuesta, Transacción)
-- ============================================

-- Estados para Partido
INSERT INTO Estado (entidad, nombre, codigo, descripcion, activo) VALUES
('PARTIDO', 'Programado', 'PROGRAMADO', 'Partido aún no iniciado', TRUE),
('PARTIDO', 'En Curso', 'EN_CURSO', 'Partido en desarrollo', TRUE),
('PARTIDO', 'Finalizado', 'FINALIZADO', 'Partido terminado', TRUE),
('PARTIDO', 'Suspendido', 'SUSPENDIDO', 'Partido suspendido temporalmente', TRUE),
('PARTIDO', 'Cancelado', 'CANCELADO', 'Partido cancelado', TRUE),
('PARTIDO', 'Pospuesto', 'POSPUESTO', 'Partido pospuesto', TRUE),

-- Estados para Apuesta
('APUESTA', 'Pendiente', 'PENDIENTE', 'Apuesta en espera de resultado', TRUE),
('APUESTA', 'Ganada', 'GANADA', 'Apuesta ganadora', TRUE),
('APUESTA', 'Perdida', 'PERDIDA', 'Apuesta perdedora', TRUE),
('APUESTA', 'Cancelada', 'CANCELADA', 'Apuesta cancelada', TRUE),
('APUESTA', 'Reembolsada', 'REEMBOLSADA', 'Apuesta reembolsada', TRUE),

-- Estados para Transacción
('TRANSACCION', 'Pendiente', 'PENDIENTE', 'Transacción en proceso', TRUE),
('TRANSACCION', 'Completada', 'COMPLETADA', 'Transacción exitosa', TRUE),
('TRANSACCION', 'Rechazada', 'RECHAZADA', 'Transacción rechazada', TRUE),
('TRANSACCION', 'Cancelada', 'CANCELADA', 'Transacción cancelada', TRUE),
('TRANSACCION', 'En Revisión', 'EN_REVISION', 'Transacción bajo revisión', TRUE);

-- ============================================
-- INSERTAR ENTRENADORES
-- ============================================
INSERT INTO Entrenador (nombre, apellido, id_pais, fecha_nacimiento, licencia, experiencia_años, activo) VALUES
('Paulo', 'Autuori', 2, '1956-11-25', 'Pro UEFA', 30, TRUE),
('Alberto', 'Gamero', 1, '1970-12-09', 'Pro CONMEBOL', 15, TRUE),
('Jorge', 'da Silva', 3, '1957-04-13', 'Pro CBF', 35, TRUE),
('Jaime', 'de la Pava', 1, '1982-03-15', 'Pro CONMEBOL', 10, TRUE),
('Pep', 'Guardiola', 4, '1971-01-18', 'Pro UEFA', 20, TRUE),
('Jürgen', 'Klopp', 5, '1967-06-16', 'Pro UEFA', 22, TRUE),
('Mikel', 'Arteta', 4, '1982-03-26', 'Pro UEFA', 5, TRUE),
('Mauricio', 'Pochettino', 2, '1972-03-02', 'Pro UEFA', 15, TRUE),
('Carlo', 'Ancelotti', 4, '1959-06-10', 'Pro UEFA', 28, TRUE),
('Xavi', 'Hernández', 4, '1980-01-25', 'Pro UEFA', 4, TRUE),
('Diego', 'Simeone', 2, '1970-04-28', 'Pro UEFA', 12, TRUE),
('Diego', 'Alonso', 9, '1975-04-16', 'Pro CONMEBOL', 10, TRUE),
('Darvin', 'Ham', 6, '1973-07-23', 'NBA', 8, TRUE),
('Joe', 'Mazzulla', 6, '1988-06-30', 'NBA', 2, TRUE),
('Steve', 'Kerr', 6, '1965-09-27', 'NBA', 10, TRUE),
('Erik', 'Spoelstra', 6, '1970-11-01', 'NBA', 15, TRUE),
('Andy', 'Reid', 6, '1958-03-19', 'NFL', 25, TRUE),
('Kyle', 'Shanahan', 6, '1979-12-14', 'NFL', 8, TRUE),
('Sean', 'McDermott', 6, '1974-03-21', 'NFL', 10, TRUE),
('Nick', 'Sirianni', 6, '1981-06-15', 'NFL', 5, TRUE),
('Jorge', 'Almirón', 2, '1971-06-19', 'Pro CONMEBOL', 12, TRUE),
('Martín', 'Demichelis', 2, '1980-12-20', 'Pro CONMEBOL', 3, TRUE);

-- ============================================
-- INSERTAR ÁRBITROS
-- ============================================
INSERT INTO Arbitro (nombre, apellido, id_pais, fecha_nacimiento, categoria, años_experiencia, activo) VALUES
('Wilmar', 'Roldán', 1, '1980-01-24', 'FIFA Internacional', 15, TRUE),
('Carlos', 'Ortega', 1, '1982-05-12', 'Primera División', 10, TRUE),
('Michael', 'Oliver', 5, '1985-02-20', 'Premier League Elite', 12, TRUE),
('Anthony', 'Taylor', 5, '1978-10-20', 'Premier League Elite', 15, TRUE),
('Antonio', 'Mateu', 4, '1977-03-12', 'La Liga Primera', 18, TRUE),
('José María', 'Sánchez', 4, '1983-08-25', 'La Liga Primera', 10, TRUE),
('Scott', 'Foster', 6, '1971-01-13', 'NBA Senior', 27, TRUE),
('Tony', 'Brothers', 6, '1970-07-21', 'NBA Senior', 28, TRUE),
('Clete', 'Blakeman', 6, '1964-11-05', 'NFL Referee', 15, TRUE),
('Brad', 'Allen', 6, '1956-08-23', 'NFL Referee', 20, TRUE),
('Andrés', 'Matonte', 9, '1978-05-15', 'CONMEBOL Internacional', 12, TRUE),
('Wilton', 'Sampaio', 3, '1981-06-17', 'FIFA Internacional', 14, TRUE);

-- ============================================
-- INSERTAR ESTADIOS
-- ============================================
INSERT INTO Estadio (nombre, id_ciudad, direccion, capacidad, año_construccion, tipo_cesped, techado, activo) VALUES
('Estadio Atanasio Girardot', 1, 'Carrera 70 #49-02', 40043, 1953, 'Natural', FALSE, TRUE),
('Estadio El Campín', 2, 'Calle 57 #30-20', 36343, 1938, 'Natural', FALSE, TRUE),
('Estadio Pascual Guerrero', 3, 'Calle 5 #49-00', 35405, 1937, 'Natural', FALSE, TRUE),
('Estadio Deportivo Cali', 3, 'Calle 23N #1N-45', 52000, 2010, 'Natural', FALSE, TRUE),
('Etihad Stadium', 12, 'Ashton New Road', 55000, 2003, 'Natural', FALSE, TRUE),
('Anfield', 13, 'Anfield Road', 54000, 1884, 'Natural', FALSE, TRUE),
('Emirates Stadium', 11, 'Hornsey Road', 60704, 2006, 'Natural', FALSE, TRUE),
('Stamford Bridge', 11, 'Fulham Road', 40834, 1877, 'Natural', FALSE, TRUE),
('Santiago Bernabéu', 8, 'Avenida Concha Espina 1', 81044, 1947, 'Natural', TRUE, TRUE),
('Camp Nou', 9, 'Carrer dAristides Maillol', 99354, 1957, 'Natural', FALSE, TRUE),
('Cívitas Metropolitano', 8, 'Avenida Luis Aragonés 4', 68456, 2017, 'Natural', FALSE, TRUE),
('Ramón Sánchez-Pizjuán', 10, 'Calle Sevilla Fútbol Club', 43883, 1958, 'Natural', FALSE, TRUE),
('Crypto.com Arena', 14, '1111 S Figueroa St', 18997, 1999, 'N/A', TRUE, TRUE),
('TD Garden', 16, '100 Legends Way', 19156, 1995, 'N/A', TRUE, TRUE),
('Chase Center', 15, '1 Warriors Way', 18064, 2019, 'N/A', TRUE, TRUE),
('Kaseya Center', 17, '601 Biscayne Blvd', 19600, 1999, 'N/A', TRUE, TRUE),
('Arrowhead Stadium', 18, '1 Arrowhead Dr', 76416, 1972, 'Natural', FALSE, TRUE),
('Levis Stadium', 15, '4900 Marie P DeBartolo Way', 68500, 2014, 'Natural', FALSE, TRUE),
('Highmark Stadium', 19, '1 Bills Dr', 71608, 1973, 'Artificial', FALSE, TRUE),
('Lincoln Financial Field', 20, '1 Lincoln Financial Field Way', 69176, 2003, 'Natural', FALSE, TRUE),
('La Bombonera', 6, 'Brandsen 805', 54000, 1940, 'Natural', FALSE, TRUE),
('Monumental', 6, 'Av. Pres. Figueroa Alcorta 7597', 84567, 1938, 'Natural', FALSE, TRUE);

-- ============================================
-- INSERTAR USUARIOS
-- ============================================
-- Contraseña para todos: "password123" (hasheada con bcrypt)
-- Hash: $2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z

INSERT INTO Usuario (username, password_hash, nombre, apellido, email, id_rol, activo) VALUES
('admin', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Carlos', 'Administrador', 'admin@sportwin.com', 1, TRUE),
('operador1', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Maria', 'Lopez', 'maria.lopez@sportwin.com', 2, TRUE),
('jperez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Juan', 'Perez', 'juan.perez@email.com', 3, TRUE),
('amartinez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Ana', 'Martinez', 'ana.martinez@email.com', 3, TRUE),
('lgomez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Luis', 'Gomez', 'luis.gomez@email.com', 3, TRUE),
('mrodriguez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Monica', 'Rodriguez', 'monica.rodriguez@email.com', 3, TRUE),
('pgarcia', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Pedro', 'Garcia', 'pedro.garcia@email.com', 3, TRUE),
('lhernandez', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Laura', 'Hernandez', 'laura.hernandez@email.com', 3, TRUE),
('cdiaz', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Carlos', 'Diaz', 'carlos.diaz@email.com', 3, TRUE),
('scastro', '$2b$10$rKZvVxwGXxJH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z8eH8YvZ8Z8Z', 'Sofia', 'Castro', 'sofia.castro@email.com', 3, TRUE);

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

INSERT INTO Apostador (id_usuario, documento, id_tipo_documento, telefono, direccion, id_ciudad, fecha_nacimiento, saldo_actual, verificado) VALUES
(3, '1234567890', 1, '3001234567', 'Calle 123 #45-67', 2, '1990-05-15', 500000.00, TRUE),
(4, '0987654321', 1, '3109876543', 'Carrera 45 #12-34', 1, '1988-08-22', 750000.00, TRUE),
(5, '1122334455', 1, '3201122334', 'Avenida 68 #23-45', 3, '1992-03-10', 300000.00, TRUE),
(6, '5544332211', 2, '3105544332', 'Calle 80 #45-12', 4, '1995-11-30', 450000.00, TRUE),
(7, '6677889900', 1, '3156677889', 'Carrera 7 #34-56', 2, '1987-07-18', 1200000.00, TRUE),
(8, '9988776655', 1, '3209988776', 'Calle 100 #15-20', 1, '1993-02-25', 600000.00, TRUE),
(9, '1357924680', 3, '3101357924', 'Avenida 15 #78-90', 3, '1998-09-05', 200000.00, FALSE),
(10, '2468013579', 4, '3152468013', 'Calle 50 #25-30', 5, '1991-12-12', 850000.00, TRUE);

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

INSERT INTO Liga (id_deporte, nombre, id_pais, temporada, fecha_inicio, fecha_fin, activo) VALUES
(1, 'Liga BetPlay', 1, '2024', '2024-01-15', '2024-12-15', TRUE),
(1, 'Premier League', 5, '2024-2025', '2024-08-10', '2025-05-25', TRUE),
(1, 'La Liga', 4, '2024-2025', '2024-08-15', '2025-05-30', TRUE),
(1, 'Copa Libertadores', 1, '2024', '2024-02-01', '2024-11-30', TRUE),
(2, 'NBA', 6, '2024-2025', '2024-10-22', '2025-06-15', TRUE),
(3, 'ATP Tour', 1, '2024', '2024-01-01', '2024-12-31', TRUE),
(4, 'MLB', 6, '2024', '2024-03-28', '2024-10-30', TRUE),
(5, 'NFL', 6, '2024', '2024-09-05', '2025-02-09', TRUE);

-- ============================================
-- INSERTAR EQUIPOS
-- ============================================

INSERT INTO Equipo (id_liga, nombre, id_pais, id_ciudad, id_estadio, id_entrenador, fundacion, activo) VALUES
-- Liga BetPlay
(1, 'Atlético Nacional', 1, 1, 1, 1, 1947, TRUE),
(1, 'Millonarios FC', 1, 2, 2, 2, 1946, TRUE),
(1, 'América de Cali', 1, 3, 3, 3, 1927, TRUE),
(1, 'Deportivo Cali', 1, 3, 4, 4, 1912, TRUE),
-- Premier League
(2, 'Manchester City', 5, 12, 5, 5, 1880, TRUE),
(2, 'Liverpool FC', 5, 13, 6, 6, 1892, TRUE),
(2, 'Arsenal FC', 5, 11, 7, 7, 1886, TRUE),
(2, 'Chelsea FC', 5, 11, 8, 8, 1905, TRUE),
-- La Liga
(3, 'Real Madrid', 4, 8, 9, 9, 1902, TRUE),
(3, 'FC Barcelona', 4, 9, 10, 10, 1899, TRUE),
(3, 'Atlético Madrid', 4, 8, 11, 11, 1903, TRUE),
(3, 'Sevilla FC', 4, 10, 12, 12, 1890, TRUE),
-- NBA
(5, 'Los Angeles Lakers', 6, 14, 13, 13, 1947, TRUE),
(5, 'Boston Celtics', 6, 16, 14, 14, 1946, TRUE),
(5, 'Golden State Warriors', 6, 15, 15, 15, 1946, TRUE),
(5, 'Miami Heat', 6, 17, 16, 16, 1988, TRUE),
-- NFL
(8, 'Kansas City Chiefs', 6, 18, 17, 17, 1960, TRUE),
(8, 'San Francisco 49ers', 6, 15, 18, 18, 1946, TRUE),
(8, 'Buffalo Bills', 6, 19, 19, 19, 1960, TRUE),
(8, 'Philadelphia Eagles', 6, 20, 20, 20, 1933, TRUE),
-- Copa Libertadores
(4, 'Boca Juniors', 2, 6, 21, 21, 1905, TRUE),
(4, 'River Plate', 2, 6, 22, 22, 1901, TRUE);

-- ============================================
-- INSERTAR PARTIDOS
-- ============================================
-- Estados: 1=PROGRAMADO, 3=FINALIZADO

INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, id_estadio, jornada, id_estado, id_arbitro, asistencia) VALUES
-- Liga BetPlay
(1, 1, 2, '2024-10-25 19:00:00', 1, 15, 1, 1, NULL),
(1, 3, 4, '2024-10-26 15:30:00', 3, 15, 1, 2, NULL),
(1, 2, 1, '2024-10-15 20:00:00', 2, 14, 3, 1, 35000),
-- Premier League
(2, 5, 6, '2024-10-27 14:00:00', 5, 10, 1, 3, NULL),
(2, 7, 8, '2024-10-27 11:30:00', 7, 10, 1, 4, NULL),
(2, 6, 5, '2024-10-20 16:00:00', 6, 9, 3, 3, 54000),
-- La Liga
(3, 9, 10, '2024-10-28 20:00:00', 9, 11, 1, 5, NULL),
(3, 11, 12, '2024-10-28 17:00:00', 11, 11, 1, 6, NULL),
(3, 10, 9, '2024-10-18 20:00:00', 10, 10, 3, 5, 85000),
-- NBA
(5, 13, 14, '2024-10-25 19:30:00', 13, 5, 1, 7, NULL),
(5, 15, 16, '2024-10-26 20:00:00', 15, 5, 1, 8, NULL),
-- NFL
(8, 17, 18, '2024-10-27 13:00:00', 17, 8, 1, 9, NULL),
(8, 19, 20, '2024-10-27 16:25:00', 19, 8, 1, 10, NULL),
-- Copa Libertadores
(4, 21, 22, '2024-10-29 21:30:00', 21, 14, 1, 11, NULL),
(4, 22, 21, '2024-10-22 21:30:00', 22, 13, 3, 12, 65000);

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
-- Estados: 7=PENDIENTE (APUESTA)

INSERT INTO Apuesta (id_apostador, id_cuota, monto_apostado, cuota_aplicada, id_estado, fecha_apuesta) VALUES
-- Apuestas de Juan Perez (id_apostador = 1)
(1, 1, 50000.00, 2.10, 7, '2024-10-20 10:30:00'),
(1, 4, 30000.00, 1.85, 7, '2024-10-20 11:00:00'),
(1, 10, 25000.00, 2.05, 7, '2024-10-22 14:00:00'),

-- Apuestas de Ana Martinez (id_apostador = 2)
(2, 14, 75000.00, 2.25, 7, '2024-10-21 09:00:00'),
(2, 17, 50000.00, 1.95, 7, '2024-10-21 15:30:00'),

-- Apuestas de Luis Gomez (id_apostador = 3)
(3, 7, 40000.00, 2.30, 7, '2024-10-22 12:00:00'),
(3, 20, 35000.00, 1.80, 7, '2024-10-23 10:00:00'),

-- Apuestas de Monica Rodriguez (id_apostador = 4)
(4, 12, 60000.00, 3.30, 7, '2024-10-22 16:00:00'),

-- Apuestas de Pedro Garcia (id_apostador = 5)
(5, 6, 100000.00, 1.75, 7, '2024-10-20 18:00:00'),
(5, 13, 80000.00, 2.20, 7, '2024-10-22 11:00:00'),

-- Apuestas de Laura Hernandez (id_apostador = 6)
(6, 15, 45000.00, 3.10, 7, '2024-10-23 09:30:00'),

-- Apuestas de Carlos Diaz (id_apostador = 7) - Usuario no verificado
(7, 2, 20000.00, 3.20, 7, '2024-10-23 13:00:00'),

-- Apuestas de Sofia Castro (id_apostador = 8)
(8, 16, 90000.00, 3.00, 7, '2024-10-23 14:30:00'),
(8, 19, 70000.00, 1.85, 7, '2024-10-23 15:00:00');

-- ============================================
-- INSERTAR TRANSACCIONES
-- ============================================
-- Estados: 12=COMPLETADA (TRANSACCION)
-- TipoTransaccion: 1=DEPOSITO, 3=APUESTA

-- Depósitos iniciales
INSERT INTO Transaccion (id_apostador, id_metodo_pago, id_tipo_transaccion, monto, comision, monto_neto, id_estado, descripcion) VALUES
(1, 1, 1, 500000.00, 12500.00, 487500.00, 12, 'Depósito inicial con tarjeta de crédito'),
(2, 3, 1, 750000.00, 0.00, 750000.00, 12, 'Depósito inicial por transferencia'),
(3, 6, 1, 300000.00, 1500.00, 298500.00, 12, 'Depósito con billetera digital'),
(4, 1, 1, 450000.00, 11250.00, 438750.00, 12, 'Depósito con tarjeta de crédito'),
(5, 2, 1, 1200000.00, 18000.00, 1182000.00, 12, 'Depósito con tarjeta de débito'),
(6, 4, 1, 600000.00, 6000.00, 594000.00, 12, 'Depósito PSE'),
(7, 5, 1, 200000.00, 0.00, 200000.00, 12, 'Depósito en efectivo'),
(8, 3, 1, 850000.00, 0.00, 850000.00, 12, 'Depósito por transferencia');

-- Transacciones de apuestas
INSERT INTO Transaccion (id_apostador, id_apuesta, id_tipo_transaccion, monto, comision, monto_neto, id_estado, descripcion) VALUES
(1, 1, 3, 50000.00, 0.00, 50000.00, 12, 'Apuesta Nacional vs Millonarios'),
(1, 2, 3, 30000.00, 0.00, 30000.00, 12, 'Apuesta más de 2.5 goles'),
(1, 3, 3, 25000.00, 0.00, 25000.00, 12, 'Apuesta Manchester City'),
(2, 4, 3, 75000.00, 0.00, 75000.00, 12, 'Apuesta Real Madrid vs Barcelona'),
(2, 5, 3, 50000.00, 0.00, 50000.00, 12, 'Apuesta Lakers'),
(3, 6, 3, 40000.00, 0.00, 40000.00, 12, 'Apuesta América vs Cali'),
(3, 7, 3, 35000.00, 0.00, 35000.00, 12, 'Apuesta Chiefs'),
(4, 8, 3, 60000.00, 0.00, 60000.00, 12, 'Apuesta Liverpool'),
(5, 9, 3, 100000.00, 0.00, 100000.00, 12, 'Apuesta Ambos anotan'),
(5, 10, 3, 80000.00, 0.00, 80000.00, 12, 'Apuesta Empate'),
(6, 11, 3, 45000.00, 0.00, 45000.00, 12, 'Apuesta Barcelona'),
(7, 12, 3, 20000.00, 0.00, 20000.00, 12, 'Apuesta Empate Nacional'),
(8, 13, 3, 90000.00, 0.00, 90000.00, 12, 'Apuesta Sevilla'),
(8, 14, 3, 70000.00, 0.00, 70000.00, 12, 'Apuesta 49ers');

-- ============================================
-- FIN DEL SCRIPT DE DATOS DE PRUEBA
-- ============================================
