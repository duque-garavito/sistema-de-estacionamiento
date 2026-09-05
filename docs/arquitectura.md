# 📐 Arquitectura Modular por Feature/Dominio

## Visión General
El proyecto **Sistema Cochera** implementa una arquitectura desacoplada y orientada a dominios (Feature-based Modular Architecture).

Cada módulo agrupa de forma autosuficiente todas sus capas:
- `components/`: Componentes UI y vistas React del módulo.
- `hooks/`: Lógica reactiva reutilizable.
- `services/`: Integración HTTP / cliente API.
- `states/`: Estado global o tienda del dominio (Zustand).
- `types/`: Interfaces y modelos de dominio en TypeScript.
- `utils/`: Utilidades específicas.

## Comunicación Frontend - Backend

```text
               +----------------------------------+
               |        REACT FRONTEND            |
               | (Modules: movimientos, boletas) |
               +----------------------------------+
                                |
                                | HTTP REST / JSON
                                v
               +----------------------------------+
               |        EXPRESS BACKEND           |
               |  (Controllers, Services, Repos)  |
               +----------------------------------+
                                |
                                | Pool mysql2
                                v
               +----------------------------------+
               |          MYSQL DATABASE          |
               | (movimientos, caja, boletas)     |
               +----------------------------------+
```

## Módulo Core (Shared Design System)
El módulo `core` contiene componentes atómicos (`Button`, `Input`, `Modal`, `Table`, `Card`) que garantizan consistencia visual y estética en todos los demás módulos sin acoplarlos.
