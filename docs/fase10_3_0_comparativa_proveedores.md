# 📄 FASE 10.3.0 — Comparativa y Selección de Proveedor Fiscal (PSE / OSE) en Perú

Documento de análisis técnico y evaluación de alternativas para la integración de emisión fiscal real en `Sistema_cochera` mediante el motor desacoplado `FiscalProvider`.

---

## 🎯 Objetivo de FASE 10.3.0

Seleccionar el proveedor fiscal **PSE (Proveedor de Servicios Electrónicos)** / **OSE (Operador de Servicios Electrónicos)** más óptimo para `Sistema_cochera`, que nos permita:
1. Operar inicialmente en un **ambiente de pruebas (Sandbox)** sin costos ni riesgo tributario.
2. Intercambiar datos vía **API REST JSON** limpia y ligera en Node.js / TypeScript.
3. Evitar la complejidad de gestionar certificados digitales `.PFX` locales o envíos SOAP nativos.
4. Obtener automáticamente el `DigestValue`, `Cadena QR` (RS N° 113-2018), `PDF`, `XML` UBL 2.1 y `CDR` firmado por SUNAT/OSE.

---

## 📊 Matriz Comparativa de Proveedores en Perú

| Criterio / Proveedor | 🥇 **NUBEFACT** | 🥈 **EFACT** | 🥉 **BIZLINKS** | 🏅 **FACTURACTIVA** |
|----------------------|----------------|--------------|-----------------|---------------------|
| **Tipo de Conexión** | API REST JSON (Súper ligera) | API REST / SOAP | API REST / SOAP | API REST JSON |
| **Generación de XML UBL 2.1** | Automática (Servidor) | Automática / Cliente | Automática / Cliente | Automática (Servidor) |
| **Firma Digital & Certificado** | Incluida por el PSE | Incluida o Propia | Exige gestionar Certificado | Incluida por el PSE |
| **Ambiente Demo / Sandbox** | 🟢 **Gratuito & Inmediato** (RUC Demo `20000000001` + Token Demo) | 🟡 Requiere registro previo de desarrollador | 🟡 Requiere solicitud corporativa | 🟢 Gratuito en Portal Dev |
| **Facilidad en Node.js / Express** | 🟢 **Excelente** (Envío HTTP POST JSON simple) | 🟡 Buena (Require formatear estructuras complejas) | 🔴 Compleja (Estructura XML/SOAP densa) | 🟢 Buena (REST JSON) |
| **Respuesta de CDR & Estado** | Síncrono e Inmediato (Retorna CDR y QR) | Asíncrono / Síncrono | Síncrono | Síncrono |
| **Costo Aprox. / Flexibilidad** | Micro-planes económicos y prepago desde S/ 30/mes | Planes medianos | Enfocado en empresas grandes | Planes prepago |
| **Documentación & Ejemplos** | 🟢 Muy clara con ejemplos curl, PHP, Node, C# | 🟡 Documentación estándar | 🟡 Documentación técnica avanzada | 🟢 Documentación REST |

---

## 🚀 Recomendación Oficial para `Sistema_cochera`: **NUBEFACT API**

### ¿Por qué NUBEFACT es la mejor opción para la arquitectura de Cochera?

1. **Desacoplamiento Absoluto mediante JSON**:
   NubeFact recibe un JSON limpio (`tipo_de_comprobante`, `serie`, `numero`, `cliente_tipo_de_documento`, `cliente_numero_de_documento`, `items`, `total`). No requiere escribir ni procesar etiquetas XML crudas en el servidor Node.js.

2. **Sandbox Inmediato de Pruebas**:
   Ofrece una URL y Token Demo permanentes para pruebas de desarrollo:
   - **URL Demo**: `https://api.nubefact.com/api/v1/12345678-1234-1234-1234-123456789012`
   - **Token Demo**: `demo_token_12345`
   - **RUC Emisor Demo**: `20000000001`

3. **Inyección en la Arquitectura Decoupled**:
   Solo requerimos crear `backend/src/modules/facturacion/providers/nubefact-fiscal.provider.ts`, que implementa la interfaz `FiscalProvider`.

---

## ⚙️ Esquema de Variables de Entorno Propueto (`.env`)

```env
# Configuración del Motor Fiscal (Desacoplado)
FISCAL_PROVIDER=MOCK  # Opciones: MOCK | NUBEFACT | EFACT
FISCAL_API_URL=https://api.nubefact.com/api/v1/YOUR_RUC_PATH
FISCAL_TOKEN=your_bearer_token_here
FISCAL_RUC_EMISOR=20123456789
FISCAL_MODO_DEMO=true
```

---

## 🛣️ Transición a FASE 10.3

```text
               FiscalProvider (Interfaz TypeScript)
                       │
       ┌───────────────┼───────────────┐
       │                               │
MockFiscalProvider             NubefactFiscalProvider
(Pruebas Offline)              (Sandbox REST / Producción)
```

**Siguiente Paso:** Validar la decisión con el cliente/usuario antes de proceder con el código de `NubefactFiscalProvider` en FASE 10.3.
