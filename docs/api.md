# 📡 Especificación de Endpoints REST API

Base URL: `/api/v1`

## 🚗 Módulo Movimientos (`/movimientos`)

### `GET /movimientos/activos`
Obtiene la lista de vehículos actualmente estacionados.
- **Respuesta:** `200 OK` (Array de `Movimiento`)

### `POST /movimientos/entrada`
Registra el ingreso de un nuevo vehículo a la cochera.
- **Body:**
  ```json
  {
    "placa": "ABC-123",
    "tipoVehiculo": "Auto",
    "color": "Plata",
    "marcaModelo": "Toyota Yaris",
    "ubicacion": "A-01"
  }
  ```
- **Respuesta:** `201 Created`

### `POST /movimientos/salida`
Registra la salida y calcula la tarifa acumulada.
- **Body:**
  ```json
  {
    "movimientoId": "MOV-1001",
    "metodoPago": "Efectivo",
    "descuento": 0
  }
  ```
- **Respuesta:** `200 OK`

---

## 🧾 Módulo Boletas (`/boletas`)

### `POST /boletas/generar`
Genera el comprobante y número de ticket para impresión térmica.
- **Respuesta:** `201 Created`
