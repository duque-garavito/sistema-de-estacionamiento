# 🚗 Sistema Cochera (Sistema de Estacionamiento)

Sistema de control, registro de vehículos, tarifas, flujo de caja y emisión de boletas/tickets de impresión térmica para gestión de estacionamiento y cochera.

## 🏗️ Arquitectura Modular por Feature/Dominio

El proyecto utiliza una estructura de **Monorepo** dividida en dominios aislados e independientes:

```text
Sistema_cochera/
├── frontend/                  ← React + TypeScript + Vite (Modular UI)
│   └── src/
│       ├── assets/
│       ├── modules/
│       │   ├── core/ (Sistema de diseño, utilidades globales)
│       │   ├── auth/
│       │   ├── vehiculos/
│       │   ├── movimientos/
│       │   ├── tarifas/
│       │   ├── caja/
│       │   ├── personal/
│       │   ├── reportes/
│       │   └── boletas/
│       ├── routes/
│       ├── App.tsx
│       └── main.tsx
│
├── backend/                   ← Node.js + Express + TypeScript (Modular API)
│   └── src/
│       ├── core/ (Base de datos, middlewares, config)
│       ├── modules/ (Controladores, servicios, repositorios por feature)
│       ├── routes/
│       └── app.ts
│
├── database/                  ← MySQL (Esquema DDL, migraciones, seeds)
├── docs/                      ← Documentación de arquitectura y API
├── package.json
└── README.md
```

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo (Backend + Frontend):**
   ```bash
   npm run dev
   ```

3. **Iniciar módulos individualmente:**
   - Frontend: `npm run dev:frontend`
   - Backend: `npm run dev:backend`

## 🛠️ Tecnologías

- **Frontend:** React 18+, TypeScript, Vite, Lucide Icons, Zustand, CSS Modules / Vanilla CSS.
- **Backend:** Node.js, Express, TypeScript, Mysql2 / Pool connection, CORS, Dotenv.
- **Base de Datos:** MySQL 8+.
