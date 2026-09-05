# 🧾 FASE 10.1 — Investigación Oficial y Arquitectura de Comprobantes Electrónicos para Perú (SUNAT)

Este documento presenta el análisis normativo, tributario y arquitectónico para la implementación de comprobantes electrónicos en el **Sistema Cochera**, garantizando total independencia entre la **operación interna de garita (tickets)** y la **emisión fiscal (SUNAT)**.

---

## 1. Normativa y Estándares SUNAT (UBL 2.1)

En el Perú, la emisión electrónica está regulada por la **Resolución de Superintendencia N° 097-2012/SUNAT** y sus modificatorias, utilizando el estándar internacional **UBL 2.1 (Universal Business Language)** estructurado en XML.

### Tipos de Comprobantes a Soportar:
1. **Factura Electrónica (Tipo 01):**
   - **Serie:** Inicia obligatoriamente con la letra **`F`** (ej. `F001`, `F002`).
   - **Requisito Cliente:** RUC de 11 dígitos activo y habida en SUNAT + Razón Social válida.
   - **Afectación IGV:** 18% para servicios de cochera/parqueo (Catálogo SUNAT N° 05: `10 - Gravado - Operación Onerosa`).
2. **Boleta de Venta Electrónica (Tipo 03):**
   - **Serie:** Inicia obligatoriamente with la letra **`B`** (ej. `B001`, `B002`).
   - **Requisito Cliente:** Opcional DNI/RUC para consumo general, identificando al cliente cuando la operación y normativa lo exijan.
3. **Nota de Crédito Electrónica (Tipo 07):**
   - Para anulación total, descuento o devolución. Requiere referencia obligatoria al comprobante origen (Serie, Correlativo y Tipo de Documento) y Motivo SUNAT (ej. `01 - Anulación de la operación`).
4. **Nota de Débito Electrónica (Tipo 08):**
   - Para sobrecargos o penalidades asociadas a un comprobante emitido.

---

## 2. Diferenciación PSE vs OSE e Interfaz Abstraída `FiscalProvider`

SUNAT contempla dos actores diferenciados:
- **PSE (Proveedor de Servicios Electrónicos):** Entidad que realiza, a nombre del emisor, las actividades de emisión, firmado y transformación a UBL 2.1.
- **OSE (Operador de Servicios Electrónicos):** Entidad autorizada que realiza la comprobación informática de las condiciones de emisión del comprobante y emite la Constancia de Recepción (CDR).

```text
                    SISTEMA COCHERA
                           │
                           ▼
                Servicio de Facturación
                           │
              ┌────────────┴────────────┐
              │                         │
        Integración Directa       Proveedor Externo
              │                         │
        SUNAT / SEE                PSE / OSE
```

### Abstracción por Interfaz `FiscalProvider`:
El motor fiscal del **Sistema Cochera** interactúa con los proveedores a través de una interfaz desacoplada:

```typescript
export interface FiscalProvider {
  emitir(cpe: ComprobanteFiscalDTO): Promise<RespuestaFiscalDTO>;
  consultar(tipo: string, serie: string, correlativo: number): Promise<RespuestaFiscalDTO>;
  anular(tipo: string, serie: string, correlativo: number, motivo: string): Promise<RespuestaFiscalDTO>;
  obtenerCdr(tipo: string, serie: string, correlativo: number): Promise<Buffer | null>;
  verificarEstado(tipo: string, serie: string, correlativo: number): Promise<EstadoSunat>;
}
```

---

## 3. Ciclo de Vida Extendido y Contingencia

```text
                   ESTADOS DEL COMPROBANTE FISCAL
                               │
                          [ BORRADOR ]
                               │
                       (Generar XML/JSON)
                               ↓
                          [ GENERADO ]
                               │
                       (Enviar a OSE/SUNAT)
                               ↓
                          [ ENVIADO ]
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
  [ ACEPTADO ]            [ PENDIENTE ]           [ RECHAZADO ]
  (CDR OK = 0)         (Reintento Red/Offline)   (Error Fiscal SUNAT)
                               │
                               ▼
                          [ ANULADO ]
```

En caso de caídas de red o indisponibilidad temporal del proveedor/SUNAT, el comprobante pasa a estado **`PENDIENTE`** para su reintento asíncrono en segundo plano, evitando bloquear la operación del parqueo.

---

## 4. Estructura Exacta del Código QR y `DigestValue`

El código QR de SUNAT no utiliza un SHA-256 arbitrario, sino el **Valor Resumen** (`DigestValue`) extraído del nodo `ds:DigestValue` del XML firmado con XMLDSIG:

```text
XML ──> Firma Digital XMLDSIG ──> DigestValue (ds:DigestValue) ──> Cadena QR ──> Imagen QR
```

### Cadena del Código QR (RS N° 113-2018/SUNAT):
`RUC_EMISOR|TIPO_DOC|SERIE|CORRELATIVO|IGV|TOTAL|FECHA_EMISION|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|DIGEST_VALUE`

---

## 5. Desacoplamiento Operación Interna vs Comprobante Fiscal

> [!IMPORTANT]
> **Regla de Oro:** Un **Ticket de Cochera (Garita)** es un documento interno de control de parqueo que NO requiere conexión a internet, DNI/RUC ni validación tributaria.
> La **Boleta / Factura Electrónica (SUNAT)** es una operación fiscal independiente que el cliente puede solicitar al salir o ingresar.

```text
Entrada vehículo ──> Movimiento #1524 ──► Ticket Garita T-001524 (Inmediato)
                                      └──► CPE B001-00000425 (Opcional / Fiscal)
```

---

## 6. Modelo de Datos Robustecido (DDL para FASE 10.2)

```sql
-- 1. Tabla de Series y Correlativos Fiscales
CREATE TABLE IF NOT EXISTS `comprobantes_series` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo_comprobante` ENUM('01', '03', '07', '08') NOT NULL,
  `serie` VARCHAR(4) NOT NULL UNIQUE,
  `correlativo_actual` INT NOT NULL DEFAULT 0,
  `activo` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 2. Tabla Principal de Comprobantes Electrónicos SUNAT
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

-- 3. Tabla de Auditoría de Comprobantes Fiscales
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
```
