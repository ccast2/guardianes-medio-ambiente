# Guardianes del Medio Ambiente 🌍

App escolar de reciclaje (proyecto "Reciclando al planeta vamos cuidando",
Escuela José Joaquín Castro Martínez, vereda Bosigas Norte, Sotaquirá — programa
Tecnokids / Ruralab). Los niños marcan qué recipientes de su punto ecológico están
llenos, el líder agenda la recogida del camión por punto, y todos ganan sellos.

## Cómo funciona

- **Niño (Guardián):** entra tocando su avatar (sin contraseña). Marca recipientes
  llenos (🟢 vidrio, 🔵 papel/cartón, 🟡 latas/plástico, 🟤 foso de orgánicos) en su
  casa y en la escuela, ve cuándo pasa el camión y sus logros (🌱 → 🌳 → 🌍).
- **Líder (profe):** entra con un PIN. Ve el estado de todos los puntos, agenda la
  recogida del camión por punto, marca "recogido" (vacía el punto y otorga un sello)
  y administra niños/PIN.

## Stack

Next.js 16 (App Router) · SQLite (`better-sqlite3`) · Tailwind CSS · Vitest.
Sin cuentas ni servicios externos: el "login" es elegir avatar + un PIN guardado en
la base de datos.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas de la capa de datos (21 tests)
```

La base SQLite se crea sola en `./data/recicla.db` con 5 niños de ejemplo, sus puntos
de casa, el punto de la escuela y un PIN por defecto.

**PIN del líder por defecto: `1234`** (cambiable en Administrar ⚙️).

## Despliegue en Railway

La app corre como servidor Node con la base SQLite en un volumen persistente.

1. `railway login`
2. `railway init` (nuevo proyecto/service; no afecta apps existentes)
3. En el dashboard del service: **Settings → Volumes → New Volume**, montado en `/data`.
4. **Variables**: `DB_PATH=/data/recicla.db`.
5. `railway up` (usa el `Dockerfile`). Railway expone un dominio `*.up.railway.app`.
6. Opcional: conectar un repo de GitHub para auto-deploy en cada push.

La base de datos vive en el volumen montado en `/data`, así que **persiste entre
despliegues**.
