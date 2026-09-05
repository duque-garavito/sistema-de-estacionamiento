// Usar fetch global de Node 18+


const BASE_URL = process.env.BASE_URL || 'http://localhost:4000/api';

async function probarPermisosRBAC() {
  console.log('===================================================================');
  console.log('🛡️ PROBANDO REGLAS DE AUTORIZACIÓN Y SEGURIDAD RBAC (FASE 7)');
  console.log('===================================================================\n');

  let pasadas = 0;
  let falladas = 0;

  // 1. Intentar actualizar tarifa con rol OPERADOR (Debe ser RECHAZADO con HTTP 403)
  try {
    const resOperador = await fetch(`${BASE_URL}/tarifas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'OPERADOR',
      },
      body: JSON.stringify({
        id: 1,
        tipoVehiculo: 'Auto',
        tipoCobro: 'DIA',
        precioHora: 5.0,
        precioDia: 99.0,
        toleranciaMinutos: 10,
        fraccion15min: 1.5,
        activo: true,
      }),
    });

    if (resOperador.status === 403) {
      console.log('✅ PASS | #1 Actualizar tarifa como OPERADOR -> HTTP 403 Forbidden (Acceso denegado correctamente)');
      pasadas++;
    } else {
      console.log(`❌ FAIL | #1 Se esperaba HTTP 403 pero se obtuvo HTTP ${resOperador.status}`);
      falladas++;
    }
  } catch (err: any) {
    console.log(`❌ FAIL | Error al probar endpoint tarifas: ${err.message}`);
    falladas++;
  }

  // 2. Intentar actualizar tarifa con rol ADMIN (Debe SER PERMITIDO con HTTP 200)
  try {
    const resAdmin = await fetch(`${BASE_URL}/tarifas`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN',
      },
      body: JSON.stringify({
        id: 1,
        tipoVehiculo: 'Auto',
        tipoCobro: 'DIA',
        precioHora: 5.0,
        precioDia: 10.0,
        toleranciaMinutos: 10,
        fraccion15min: 1.5,
        activo: true,
      }),
    });

    if (resAdmin.status === 200) {
      console.log('✅ PASS | #2 Actualizar tarifa como ADMIN -> HTTP 200 OK (Acceso permitido correctamente)');
      pasadas++;
    } else {
      console.log(`❌ FAIL | #2 Se esperaba HTTP 200 pero se obtuvo HTTP ${resAdmin.status}`);
      falladas++;
    }
  } catch (err: any) {
    console.log(`❌ FAIL | Error al probar endpoint tarifas: ${err.message}`);
    falladas++;
  }

  // 3. Intentar agregar a Lista Negra como OPERADOR (Debe ser RECHAZADO con HTTP 403)
  try {
    const resLN = await fetch(`${BASE_URL}/lista-negra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'OPERADOR',
      },
      body: JSON.stringify({
        placa: 'TEST-999',
        motivo: 'Intento no autorizado de operador',
      }),
    });

    if (resLN.status === 403) {
      console.log('✅ PASS | #3 Agregar a Lista Negra como OPERADOR -> HTTP 403 Forbidden (Rechazado correctamente)');
      pasadas++;
    } else {
      console.log(`❌ FAIL | #3 Se esperaba HTTP 403 pero se obtuvo HTTP ${resLN.status}`);
      falladas++;
    }
  } catch (err: any) {
    console.log(`❌ FAIL | Error en Lista Negra: ${err.message}`);
    falladas++;
  }

  console.log('\n-------------------------------------------------------------------');
  console.log(`TOTAL PRUEBAS RBAC: ${pasadas + falladas} | PASARON: ${pasadas} | FALLARON: ${falladas}`);
  console.log('-------------------------------------------------------------------\n');
}

probarPermisosRBAC();
