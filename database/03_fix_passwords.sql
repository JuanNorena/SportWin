-- Actualización de contraseñas con hashes válidos de bcrypt

-- admin / Contraseña: admin123
UPDATE Usuario SET password_hash = '$2b$10$FA7SW86b0OTGW8.XQpczcegE6xhCwXuSC8GSkQN9ToJeOMeimyTcu' WHERE username = 'admin';

-- operador1 / Contraseña: operador123
UPDATE Usuario SET password_hash = '$2b$10$LrQlwcJjcYG6nr4aij7bWeI18c7QxJjX2.NwR5/YyTxBlZbvuHkDu' WHERE username = 'operador1';

-- jperez / Contraseña: jperez123
UPDATE Usuario SET password_hash = '$2b$10$n7vmnpz6SpJYkeP8723y9u3kgOSsIaV1SY7AQmDFY4lnY06xP6vfG' WHERE username = 'jperez';

-- amartinez / Contraseña: amartinez123
UPDATE Usuario SET password_hash = '$2b$10$39ZuzmwZm3.OWq58yM1Ejum6/CRBF4cU3I4VUrCy98RRDZH7DJQb6' WHERE username = 'amartinez';

-- lgomez / Contraseña: lgomez123
UPDATE Usuario SET password_hash = '$2b$10$JGX8vuZMUv8Opt/9Si6wo.Z4w1EcCiegIU.3KAv6ZPLNAy9v21mqi' WHERE username = 'lgomez';

-- mrodriguez / Contraseña: mrodriguez123
UPDATE Usuario SET password_hash = '$2b$10$ytN6us/kNGGYOA7zJc4nSun5HID8QPeIcdWHDnQtuid/RFKZlw2zC' WHERE username = 'mrodriguez';

-- pgarcia / Contraseña: pgarcia123
UPDATE Usuario SET password_hash = '$2b$10$82fjlFnZSCFl1Nmjbe22xOKqT3V9G5X7rtcAdNbcFzFvL9EMrh3fK' WHERE username = 'pgarcia';

-- lhernandez / Contraseña: lhernandez123
UPDATE Usuario SET password_hash = '$2b$10$Z.yFDCn/bVBX0pa2q.rlcu5NB7v6f5yj0VJzj3.zu7r2a8C5/flry' WHERE username = 'lhernandez';

-- cdiaz / Contraseña: cdiaz123
UPDATE Usuario SET password_hash = '$2b$10$Z4U0XSmpto36jsll/EWYZOqziPAJYj7/2AOz6zvgWkNeC2f.N4RNa' WHERE username = 'cdiaz';

-- scastro / Contraseña: scastro123
UPDATE Usuario SET password_hash = '$2b$10$YejOBvd6E8eNsYCO0TI14.29OIae6s3sJ7TKxUndR17rFsEoZfNaG' WHERE username = 'scastro';

SELECT 'Contraseñas actualizadas correctamente' as mensaje;
