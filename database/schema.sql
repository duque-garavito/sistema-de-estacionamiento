-- =============================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA COCHERA
-- Engine: MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS `cochera_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cochera_db`;

-- 1. Tabla Usuarios (Personal y Operadores)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('ADMIN', 'OPERADOR', 'CAJERO') NOT NULL DEFAULT 'OPERADOR',
  `estado` TINYINT(1) DEFAULT 1,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla Tarifas
CREATE TABLE IF NOT EXISTS `tarifas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo_vehiculo` ENUM('Auto', 'Camioneta', 'Moto', 'Bicicleta') NOT NULL UNIQUE,
  `tipo_cobro` ENUM('HORA', 'DIA', 'MIXTO') NOT NULL DEFAULT 'DIA',
  `precio_hora` DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  `precio_dia` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  `tolerancia_minutos` INT DEFAULT 10,
  `fraccion_15min` DECIMAL(10,2) DEFAULT 1.50,
  `activo` TINYINT(1) DEFAULT 1,
  `actualizado_en` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla Movimientos (Ingresos y Salidas de Parqueo por Día)
CREATE TABLE IF NOT EXISTS `movimientos` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `codigo_ticket` VARCHAR(20) NOT NULL UNIQUE,
  `placa` VARCHAR(10) NOT NULL,
  `tipo_vehiculo` ENUM('Auto', 'Camioneta', 'Moto', 'Bicicleta') NOT NULL,
  `color` VARCHAR(30),
  `marca_modelo` VARCHAR(50),
  `propietario_dni` VARCHAR(15),
  `propietario_nombre` VARCHAR(100),
  `fecha_entrada` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_salida` DATETIME NULL,
  `tarifa_dia_aplicada` DECIMAL(10,2) NOT NULL,
  `dias_cobrados` INT DEFAULT 1,
  `total_pagar` DECIMAL(10,2) NULL,
  `momento_pago` ENUM('ENTRADA', 'SALIDA') NOT NULL DEFAULT 'SALIDA',
  `metodo_pago` VARCHAR(30) DEFAULT 'Efectivo',
  `usuario_ingreso` VARCHAR(100) DEFAULT 'Operador Entrada',
  `usuario_salida` VARCHAR(100) NULL,
  `estado` ENUM('Activo', 'Completado', 'Anulado') DEFAULT 'Activo',
  `ubicacion` VARCHAR(20) DEFAULT 'General',
  `observaciones` TEXT,
  INDEX `idx_placa` (`placa`),
  INDEX `idx_estado` (`estado`)
) ENGINE=InnoDB;

-- 4. Tabla Lista Negra (Vehículos Restringidos)
CREATE TABLE IF NOT EXISTS `lista_negra` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `placa` VARCHAR(10) NOT NULL UNIQUE,
  `motivo` TEXT NOT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `registrado_por` VARCHAR(100) DEFAULT 'Administrador',
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_placa_lista_negra` (`placa`)
) ENGINE=InnoDB;

-- 5. Tabla Gastos (Egresos Operativos de Caja)
CREATE TABLE IF NOT EXISTS `gastos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `descripcion` TEXT NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `usuario_id` INT DEFAULT 1,
  `usuario_nombre` VARCHAR(100) DEFAULT 'Administrador',
  `fecha_hora` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fecha_gasto` (`fecha_hora`)
) ENGINE=InnoDB;

-- 6. Tabla Empresa Config (Datos Fiscales Cochera)
CREATE TABLE IF NOT EXISTS `empresa_config` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `ruc` VARCHAR(11) NOT NULL DEFAULT '20123456789',
  `razon_social` VARCHAR(150) NOT NULL DEFAULT 'COCHERA CENTRAL S.A.C.',
  `nombre_comercial` VARCHAR(150) DEFAULT 'Cochera Central',
  `direccion` TEXT NOT NULL,
  `telefono` VARCHAR(20) DEFAULT '(01) 456-7890',
  `serie_boleta` VARCHAR(10) DEFAULT 'B001',
  `correlativo_boleta` INT DEFAULT 1,
  `serie_factura` VARCHAR(10) DEFAULT 'F001',
  `correlativo_factura` INT DEFAULT 1,
  `leyenda_ticket` TEXT,
  `actualizado_en` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `empresa_config` (`id`, `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `telefono`, `serie_boleta`, `correlativo_boleta`, `serie_factura`, `correlativo_factura`, `leyenda_ticket`)
VALUES (1, '20123456789', 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.', 'Cochera Central', 'Av. Principal 123, Miraflores, Lima', '(01) 456-7890', 'B001', 1, 'F001', 1, '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.')
ON DUPLICATE KEY UPDATE `id` = 1;

-- 7. Tabla Boletas / Comprobantes Emitidos (Dual: Térmico y Fiscal)
CREATE TABLE IF NOT EXISTS `boletas` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `numero_ticket` VARCHAR(30) NOT NULL UNIQUE,
  `movimiento_id` BIGINT NULL,
  `caja_id` INT NULL,
  `tipo_comprobante` ENUM('TICKET', 'BOLETA', 'FACTURA') NOT NULL DEFAULT 'TICKET',
  `serie` VARCHAR(10) DEFAULT 'T001',
  `correlativo` INT DEFAULT 1,
  `cliente_tipo_doc` ENUM('DNI', 'RUC', 'VARIOS') DEFAULT 'VARIOS',
  `cliente_num_doc` VARCHAR(20) DEFAULT '-',
  `cliente_nombre` VARCHAR(150) DEFAULT 'CLIENTE VARIOS',
  `cliente_direccion` TEXT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `igv` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `metodo_pago` ENUM('Efectivo', 'Yape', 'Plin', 'Tarjeta') NOT NULL DEFAULT 'Efectivo',
  `cajero` VARCHAR(100) DEFAULT 'Operador Caja #1',
  `fecha_emision` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`movimiento_id`) REFERENCES `movimientos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Tabla Series y Correlativos Fiscales (FASE 10.2)
CREATE TABLE IF NOT EXISTS `comprobantes_series` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo_comprobante` ENUM('01', '03', '07', '08') NOT NULL,
  `serie` VARCHAR(4) NOT NULL UNIQUE,
  `correlativo_actual` INT NOT NULL DEFAULT 0,
  `activo` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 9. Tabla Principal Comprobantes Electrónicos SUNAT (FASE 10.2)
CREATE TABLE IF NOT EXISTS `comprobantes_electronicos` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `movimiento_id` BIGINT NULL,
  `tipo_comprobante` ENUM('01', '03', '07', '08') NOT NULL,
  `serie` VARCHAR(4) NOT NULL,
  `correlativo` INT NOT NULL,
  `fecha_emision` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_envio` DATETIME NULL,
  `fecha_respuesta` DATETIME NULL,
  `cliente_tipo_doc` ENUM('6', '1', '0') NOT NULL DEFAULT '0', -- 6: RUC, 1: DNI, 0: VARIOS
  `cliente_num_doc` VARCHAR(15) DEFAULT '-',
  `cliente_nombre` VARCHAR(150) NOT NULL DEFAULT 'CLIENTES VARIOS',
  `cliente_direccion` TEXT NULL,
  `moneda` VARCHAR(3) DEFAULT 'PEN',
  `op_gravadas` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `op_exoneradas` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `igv` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` VARCHAR(30) DEFAULT 'Efectivo',
  `estado_sunat` ENUM('BORRADOR', 'GENERADO', 'ENVIADO', 'PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'ANULADO') DEFAULT 'BORRADOR',
  `codigo_respuesta_sunat` VARCHAR(10) NULL,
  `mensaje_respuesta_sunat` TEXT NULL,
  `digest_value` VARCHAR(100) NULL,
  `codigo_qr` TEXT NULL,
  `xml_path` TEXT NULL,
  `cdr_path` TEXT NULL,
  `usuario_id` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_comprobante_unico` (`tipo_comprobante`, `serie`, `correlativo`),
  FOREIGN KEY (`movimiento_id`) REFERENCES `movimientos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Tabla Auditoría de Comprobantes Fiscales (FASE 10.2)
CREATE TABLE IF NOT EXISTS `comprobantes_auditoria` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `comprobante_id` BIGINT NOT NULL,
  `estado_anterior` VARCHAR(20) NOT NULL,
  `estado_nuevo` VARCHAR(20) NOT NULL,
  `usuario_id` INT DEFAULT 1,
  `observacion` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`comprobante_id`) REFERENCES `comprobantes_electronicos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

