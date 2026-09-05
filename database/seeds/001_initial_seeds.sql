USE `cochera_db`;

-- Seeds para Tarifas
INSERT INTO `tarifas` (`tipo_vehiculo`, `tipo_cobro`, `precio_hora`, `precio_dia`, `tolerancia_minutos`, `fraccion_15min`, `activo`) VALUES
('Auto', 'DIA', 5.00, 10.00, 10, 1.50, 1),
('Camioneta', 'DIA', 7.00, 15.00, 10, 2.00, 1),
('Moto', 'DIA', 3.00, 5.00, 10, 1.00, 1),
('Bicicleta', 'DIA', 1.50, 3.00, 10, 0.50, 1);

-- Seeds para Usuarios
INSERT INTO `usuarios` (`nombre`, `email`, `password_hash`, `rol`) VALUES
('Administrador Cochera', 'admin@cochera.com', '$2a$12$eImiTXuWVxfM37uY4JANjO5E.d/mXm1Q.h4Z/uH/uO8QjE.GzP.m2', 'ADMIN'),
('Cajero Operador 1', 'cajero1@cochera.com', '$2a$12$eImiTXuWVxfM37uY4JANjO5E.d/mXm1Q.h4Z/uH/uO8QjE.GzP.m2', 'CAJERO');
