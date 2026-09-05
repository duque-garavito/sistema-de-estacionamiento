import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_cochera',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function inicializarTablasDatabase(): Promise<void> {
  try {
    // 0. Tabla usuarios & alter si la tabla existía con esquema previo
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`usuarios\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NULL,
        \`rol\` ENUM('ADMIN', 'OPERADOR', 'CAJERO') NOT NULL DEFAULT 'OPERADOR',
        \`estado\` TINYINT(1) DEFAULT 1,
        \`creado_en\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    try {
      await dbPool.query(`ALTER TABLE \`usuarios\` ADD COLUMN \`password_hash\` VARCHAR(255) NULL`);
    } catch {}
    try {
      await dbPool.query(`ALTER TABLE \`usuarios\` ADD COLUMN \`rol\` ENUM('ADMIN', 'OPERADOR', 'CAJERO') NOT NULL DEFAULT 'OPERADOR'`);
    } catch {}
    try {
      await dbPool.query(`ALTER TABLE \`usuarios\` ADD COLUMN \`estado\` TINYINT(1) NOT NULL DEFAULT 1`);
    } catch {}

    // Verificar e insertar usuarios por defecto con passwords hash de bcrypt
    const [userRows]: any = await dbPool.query('SELECT id FROM usuarios WHERE email = ?', ['admin@cocheracentral.pe']);
    if (!Array.isArray(userRows) || userRows.length === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await dbPool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 1)',
        ['Administrador Cochera', 'admin@cocheracentral.pe', adminHash, 'ADMIN']
      );
      console.log('🔒 Usuario Administrador creado (admin@cocheracentral.pe / admin123)');
    }

    const [cajeroRows]: any = await dbPool.query('SELECT id FROM usuarios WHERE email = ?', ['cajero@cocheracentral.pe']);
    if (!Array.isArray(cajeroRows) || cajeroRows.length === 0) {
      const cajeroHash = await bcrypt.hash('cajero123', 10);
      await dbPool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 1)',
        ['Cajero Turno Principal', 'cajero@cocheracentral.pe', cajeroHash, 'CAJERO']
      );
    }

    const [operadorRows]: any = await dbPool.query('SELECT id FROM usuarios WHERE email = ?', ['operador@cocheracentral.pe']);
    if (!Array.isArray(operadorRows) || operadorRows.length === 0) {
      const operadorHash = await bcrypt.hash('operador123', 10);
      await dbPool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, estado) VALUES (?, ?, ?, ?, 1)',
        ['Operador Garita', 'operador@cocheracentral.pe', operadorHash, 'OPERADOR']
      );
    }

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
  } catch (err: any) {
    console.error('Error inicializando tablas en MySQL:', err.message);
  }
}
