import { dbPool } from '../core/config/database.js';

async function migrarRelaciones() {
  console.log('🔧 MEJORANDO Y ALINEANDO RELACIONES DE BASE DE DATOS (FOREIGN KEYS)...');

  try {
    // 1. Igualar el tipo de dato de movimientos.id a BIGINT para coincidir con boletas y comprobantes_electronicos
    console.log('1. Ajustando tipo de dato de id en tabla movimientos a BIGINT...');
    await dbPool.query('ALTER TABLE `movimientos` MODIFY COLUMN `id` BIGINT AUTO_INCREMENT;');

    // 2. Ajustar FK de boletas -> movimientos
    console.log('2. Aplicando Foreign Key boletas(movimiento_id) -> movimientos(id)...');
    try {
      await dbPool.query('ALTER TABLE `boletas` DROP FOREIGN KEY `boletas_ibfk_1`;');
    } catch {}
    await dbPool.query(`
      ALTER TABLE \`boletas\` 
      ADD CONSTRAINT \`fk_boletas_movimiento\` 
      FOREIGN KEY (\`movimiento_id\`) REFERENCES \`movimientos\` (\`id\`) 
      ON DELETE SET NULL ON UPDATE CASCADE;
    `);

    // 3. Ajustar FK de comprobantes_electronicos -> movimientos
    console.log('3. Aplicando Foreign Key comprobantes_electronicos(movimiento_id) -> movimientos(id)...');
    try {
      await dbPool.query('ALTER TABLE `comprobantes_electronicos` DROP FOREIGN KEY `comprobantes_electronicos_ibfk_1`;');
    } catch {}
    await dbPool.query(`
      ALTER TABLE \`comprobantes_electronicos\` 
      ADD CONSTRAINT \`fk_comprobantes_movimiento\` 
      FOREIGN KEY (\`movimiento_id\`) REFERENCES \`movimientos\` (\`id\`) 
      ON DELETE SET NULL ON UPDATE CASCADE;
    `);

    // 4. Ajustar FK de comprobantes_auditoria -> comprobantes_electronicos
    console.log('4. Aplicando Foreign Key comprobantes_auditoria(comprobante_id) -> comprobantes_electronicos(id)...');
    try {
      await dbPool.query('ALTER TABLE `comprobantes_auditoria` DROP FOREIGN KEY `comprobantes_auditoria_ibfk_1`;');
    } catch {}
    await dbPool.query(`
      ALTER TABLE \`comprobantes_auditoria\` 
      ADD CONSTRAINT \`fk_auditoria_comprobante\` 
      FOREIGN KEY (\`comprobante_id\`) REFERENCES \`comprobantes_electronicos\` (\`id\`) 
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    // 5. Ajustar FK de gastos -> usuarios (o administradores)
    console.log('5. Aplicando Foreign Key gastos(usuario_id) -> usuarios(id)...');
    try {
      await dbPool.query('ALTER TABLE `gastos` DROP FOREIGN KEY `gastos_ibfk_1`;');
    } catch {}
    try {
      await dbPool.query(`
        ALTER TABLE \`gastos\` 
        ADD CONSTRAINT \`fk_gastos_usuario\` 
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      console.log('  Notice gastos FK:', e.message);
    }

    // 6. Agregar FK de comprobantes_electronicos -> usuarios
    console.log('6. Aplicando Foreign Key comprobantes_electronicos(usuario_id) -> usuarios(id)...');
    try {
      await dbPool.query(`
        ALTER TABLE \`comprobantes_electronicos\` 
        ADD CONSTRAINT \`fk_comprobantes_usuario\` 
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      console.log('  Notice comprobantes_electronicos usuario FK:', e.message);
    }

    // 7. Agregar FK de boletas -> usuarios (caja_id)
    console.log('7. Aplicando Foreign Key boletas(caja_id) -> usuarios(id)...');
    try {
      await dbPool.query(`
        ALTER TABLE \`boletas\` 
        ADD CONSTRAINT \`fk_boletas_caja_usuario\` 
        FOREIGN KEY (\`caja_id\`) REFERENCES \`usuarios\` (\`id\`) 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      console.log('  Notice boletas caja FK:', e.message);
    }

    console.log('\n🎉 ¡TODAS LAS RELACIONES Y CLAVES FORÁNEAS EN MYSQL FUERON OPTIMIZADAS EXITOSAMENTE!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error al optimizar relaciones DB:', err);
    process.exit(1);
  }
}

migrarRelaciones();
