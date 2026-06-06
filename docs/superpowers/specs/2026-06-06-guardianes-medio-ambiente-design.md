# Guardianes del Medio Ambiente — Diseño

**Fecha:** 2026-06-06
**Proyecto:** Reciclando al Planeta Vamos Cuidando — Escuela José Joaquín Castro Martínez (vereda Bosigas Norte, Sotaquirá, Boyacá). Programa Tecnokids / Ruralab, Secretaría de Educación de Boyacá.
**Docente/líder:** María Inés A. · Líder de vereda: Erika Barrera.

## Contexto

Proyecto escolar de reciclaje y sostenibilidad. Cada casa de los estudiantes y la escuela
tienen un **punto ecológico** (vidrio, papel/cartón, latas/plástico) y un **foso de compostaje**
para orgánicos. Marco teórico (Edgar Morin): cultura ecológica, ética y responsabilidad
ambiental, formación de hábitos.

La app digitaliza la **dinámica TIC de avisos de recogida** mencionada en el proyecto:
los niños avisan cuándo su punto está lleno y el líder agenda/coordina la recogida del
camión de reciclables.

## Objetivo

App web responsive, muy simple y llamativa para niños de grados 1–5, donde:
- Cada niño marca qué recipientes de su punto ecológico están llenos.
- El líder ve el estado de todos los puntos y agenda la recogida del camión por punto.
- El niño ve cuándo pasa el camión por su casa.
- Se motiva el hábito con sellos/logros (sin ranking competitivo).

## Roles y acceso (sin cuentas)

| Rol | Acceso | Acciones |
|-----|--------|----------|
| 🧒 Niño (Guardián) | Toca su avatar de una lista, **sin contraseña** | Marcar recipientes llenos, avisar al líder, ver recogida, ver sus logros |
| 🧑‍🏫 Líder | Botón "Soy el líder" + **PIN simple** (guardado en settings) | Ver tablero de todos los puntos, agendar camión, marcar recogido, administrar niños/PIN |

- Elección de avatar = login del niño (opción A acordada). Responsive para uso desde casa.
- El PIN del líder evita que los niños entren a administrar. Por defecto `1234`, editable en Admin.

## Puntos y recipientes

- Cada niño tiene **1 punto `home`** (su casa). Existe **1 punto `school`** compartido.
- Cada punto tiene **4 recipientes** (opción C acordada — clasificación por tipo):
  - 🟢 Vidrio (`glass`)
  - 🔵 Papel/Cartón (`paper`)
  - 🟡 Latas/Plástico (`cans`)
  - 🟤 Foso / orgánicos / compostaje (`organic`)

## Pantallas

1. **Inicio / "¿Quién eres?"** — caritas de los niños + botón discreto "Soy el líder".
2. **Panel del niño** — saludo + sello actual; tarjetas "🏠 Mi casa" y "🏫 La escuela" con los
   4 recipientes como botones grandes (tocar = lleno/vacío); botón "Avisar al líder 🚛" con
   animación; tarjeta de recogida con fecha y cuenta regresiva; acceso a "Mis logros".
3. **Mis logros (niño)** — sellos ganados (🌱→🌳→🌍), veces que ha reciclado, contador
   colectivo ("Entre todos reciclamos N veces 🎉").
4. **Tablero del líder** — grilla con los 5 puntos de casa + escuela; muestra recipientes
   llenos y desde cuándo; resalta "⚠️ Espera recogida"; botones "Agendar camión 📅" y
   "Marcar como recogido ✅".
5. **Administrar (líder)** — agregar/editar/quitar niños (nombre + avatar) y cambiar PIN.

## Modelo de datos (SQLite)

**children** — `id`, `name`, `avatar` (emoji/img), `grade` (1–5), `seal_count`, `created_at`.

**points** — `id`, `child_id` (NULL = punto escuela), `kind` (`home`|`school`), `label`,
`pickup_date` (NULL), `pickup_status` (`none`|`scheduled`|`collected`).

**bins** — `id`, `point_id`, `type` (`glass`|`paper`|`cans`|`organic`), `is_full` (bool),
`marked_at`.

**settings** — `key`, `value` (ej. `leader_pin` = `1234`).

Reglas derivadas:
- "Avisar al líder" no usa tabla aparte: el líder ve los `bins` con `is_full = true`.
- "Marcar como recogido": `bins.is_full = false` para el punto, `pickup_status = 'collected'`,
  `child.seal_count + 1` (solo si el punto tenía al menos un recipiente lleno).
- Contador colectivo = suma de `seal_count`.
- Sello visual derivado de `seal_count`: 0–2 = 🌱, 3–6 = 🌳, 7+ = 🌍 (no se almacena).

## Flujos

1. **Marcar y avisar:** niño toca recipiente → `is_full=true`, `marked_at=ahora` → "Avisar al líder" → confirmación.
2. **Agendar camión:** líder ve punto resaltado → "Agendar camión" → elige fecha → `pickup_date`, `pickup_status='scheduled'`.
3. **Ver recogida:** niño ve fecha + cuenta regresiva; si no hay fecha, mensaje amable.
4. **Recogida realizada:** líder marca recogido → recipientes a vacío, `pickup_status='collected'`, sello al niño + contador colectivo.

**Casos borde:** marcar/desmarcar libre; punto sin fecha → mensaje, no error; recoger sin
recipientes llenos no otorga sello.

## Arquitectura técnica

- **Next.js (App Router)** en modo servidor (servidor Node persistente en Railway).
- **SQLite + `better-sqlite3`**; archivo en `DB_PATH` (`/data/recicla.db` en Railway,
  `./data/recicla.db` en local).
- **Tailwind CSS** para estilo responsive y llamativo (se afina con la skill de frontend).
- Lógica con **Server Actions / Route Handlers** de Next.js. Sin API externa ni librería de auth.

Estructura borrador:
```
/app
  /page.tsx              → Inicio (¿quién eres?)
  /nino/[id]/page.tsx    → Panel del niño + logros
  /lider/page.tsx        → Tablero del líder
  /lider/admin/page.tsx  → Administrar
  /actions.ts            → server actions
/lib/db.ts               → conexión SQLite + init tablas + seed
/data/recicla.db         → base de datos
```

**Seed inicial:** si la base está vacía, crea los 5 niños (Damián 1°, Jerónimo 2°, Chaves 3°,
Barrera 4°, Rodríguez 5°), sus puntos de casa, el punto de escuela, los recipientes y PIN `1234`.
Nombres/avatares editables por el líder.

## Despliegue (Railway)

1. `railway init` o conectar repo GitHub → nuevo *service* (no afecta apps existentes).
2. Crear **volumen** montado en `/data`.
3. Variable de entorno `DB_PATH=/data/recicla.db`.
4. `railway up` → online en `*.up.railway.app`. Auto-deploy opcional vía GitHub.

SQLite persiste entre redeploys porque vive en el volumen. Sin cuentas nuevas.

## Fuera de alcance (YAGNI por ahora)

- Fotos de los puntos llenos.
- Notas de texto del líder.
- Ruta ordenada de paradas del camión.
- Ranking competitivo entre niños.
- Notificaciones push / correo.

Cualquiera de estos se puede agregar después sin rehacer el modelo.
