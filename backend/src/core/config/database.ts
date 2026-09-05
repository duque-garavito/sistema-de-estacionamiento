import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cochera_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function inicializarTablasDatabase(): Promise<void> {
  try {
    // 1. Tabla empresa_config
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`empresa_config\` (
        \`id\` INT PRIMARY KEY DEFAULT 1,
        \`ruc\` VARCHAR(11) NOT NULL DEFAULT '20123456789',
        \`razon_social\` VARCHAR(150) NOT NULL DEFAULT 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
        \`nombre_comercial\` VARCHAR(150) DEFAULT 'Cochera Central',
        \`direccion\` TEXT NOT NULL,
        \`telefono\` VARCHAR(20) DEFAULT '(01) 456-7890',
        \`serie_boleta\` VARCHAR(10) DEFAULT 'B001',
        \`correlativo_boleta\` INT DEFAULT 1,
        \`serie_factura\` VARCHAR(10) DEFAULT 'F001',
        \`correlativo_factura\` INT DEFAULT 1,
        \`leyenda_ticket\` TEXT,
        \`capacidad_total\` INT DEFAULT 50,
        \`formato_ticket\` VARCHAR(10) DEFAULT '80mm',
        \`tolerancia_minutos\` INT DEFAULT 10,
        \`actualizado_en\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await dbPool.query(`
      INSERT INTO \`empresa_config\` (\`id\`, \`ruc\`, \`razon_social\`, \`nombre_comercial\`, \`direccion\`, \`telefono\`, \`serie_boleta\`, \`correlativo_boleta\`, \`serie_factura\`, \`correlativo_factura\`, \`leyenda_ticket\`)
      VALUES (1, '20123456789', 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.', 'Cochera Central', 'Av. Principal 123, Miraflores, Lima', '(01) 456-7890', 'B001', 1, 'F001', 1, '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.')
      ON DUPLICATE KEY UPDATE \`id\` = 1;
    `);

    // 2. Tabla boletas
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`boletas\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`numero_ticket\` VARCHAR(30) NOT NULL UNIQUE,
        \`movimiento_id\` BIGINT NULL,
        \`caja_id\` INT NULL,
        \`tipo_comprobante\` ENUM('TICKET', 'BOLETA', 'FACTURA') NOT NULL DEFAULT 'TICKET',
        \`serie\` VARCHAR(10) DEFAULT 'T001',
        \`correlativo\` INT DEFAULT 1,
        \`cliente_tipo_doc\` ENUM('DNI', 'RUC', 'VARIOS') DEFAULT 'VARIOS',
        \`cliente_num_doc\` VARCHAR(20) DEFAULT '-',
        \`cliente_nombre\` VARCHAR(150) DEFAULT 'CLIENTE VARIOS',
        \`cliente_direccion\` TEXT NULL,
        \`subtotal\` DECIMAL(10,2) NOT NULL,
        \`igv\` DECIMAL(10,2) NOT NULL,
        \`total\` DECIMAL(10,2) NOT NULL,
        \`metodo_pago\` ENUM('Efectivo', 'Yape', 'Plin', 'Tarjeta') NOT NULL DEFAULT 'Efectivo',
        \`cajero\` VARCHAR(100) DEFAULT 'Operador Caja #1',
        \`fecha_emision\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Tabla comprobantes_series
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`comprobantes_series\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tipo_comprobante\` ENUM('01', '03', '07', '08') NOT NULL,
        \`serie\` VARCHAR(4) NOT NULL UNIQUE,
        \`correlativo_actual\` INT NOT NULL DEFAULT 0,
        \`activo\` TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB;
    `);

    // 4. Tabla comprobantes_electronicos
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`comprobantes_electronicos\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`movimiento_id\` BIGINT NULL,
        \`tipo_comprobante\` ENUM('01', '03', '07', '08') NOT NULL,
        \`serie\` VARCHAR(4) NOT NULL,
        \`correlativo\` INT NOT NULL,
        \`fecha_emision\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`fecha_envio\` DATETIME NULL,
        \`fecha_respuesta\` DATETIME NULL,
        \`cliente_tipo_doc\` ENUM('6', '1', '0') NOT NULL DEFAULT '0',
        \`cliente_num_doc\` VARCHAR(15) DEFAULT '-',
        \`cliente_nombre\` VARCHAR(150) NOT NULL DEFAULT 'CLIENTES VARIOS',
        \`cliente_direccion\` TEXT NULL,
        \`moneda\` VARCHAR(3) DEFAULT 'PEN',
        \`op_gravadas\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`op_exoneradas\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`igv\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`metodo_pago\` VARCHAR(30) DEFAULT 'Efectivo',
        \`estado_sunat\` ENUM('BORRADOR', 'GENERADO', 'ENVIADO', 'PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'ANULADO') DEFAULT 'BORRADOR',
        \`codigo_respuesta_sunat\` VARCHAR(10) NULL,
        \`mensaje_respuesta_sunat\` TEXT NULL,
        \`digest_value\` VARCHAR(100) NULL,
        \`codigo_qr\` TEXT NULL,
        \`xml_path\` TEXT NULL,
        \`cdr_path\` TEXT NULL,
        \`usuario_id\` INT DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uk_comprobante_unico\` (\`tipo_comprobante\`, \`serie\`, \`correlativo\`)
      ) ENGINE=InnoDB;
    `);

    // 5. Tabla comprobantes_auditoria
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`comprobantes_auditoria\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`comprobante_id\` BIGINT NOT NULL,
        \`estado_anterior\` VARCHAR(20) NOT NULL,
        \`estado_nuevo\` VARCHAR(20) NOT NULL,
        \`usuario_id\` INT DEFAULT 1,
        \`observacion\` TEXT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 6. Tabla lista_negra
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`lista_negra\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`placa\` VARCHAR(10) NOT NULL UNIQUE,
        \`motivo\` TEXT NOT NULL,
        \`activo\` TINYINT(1) DEFAULT 1,
        \`registrado_por\` VARCHAR(100) DEFAULT 'Administrador',
        \`creado_en\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (err) {
    // Si MySQL está desconectado, continúa con fallback en memoria
  }
}

