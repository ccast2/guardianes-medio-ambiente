# Portada de presentación + página "Cómo se hizo"

Fecha: 2026-06-08

## Objetivo

Agregar una **portada de presentación** (cortina) como primera pantalla de la app,
con los logos institucionales y los datos del equipo y el proyecto, y una página
**"Cómo se hizo"** que explique a la profesora cómo se construyó la app con IA.

## Activos (logos)

Recortados de 3 capturas de WhatsApp con ImageMagick → `public/logos/`:

- `boyaca-tic.png` — escudo + "Gobernación de Boyacá" (el "TIC" se pone como texto,
  porque venía cortado en la captura).
- `go-escuela.png` — logo "GO ESCUELA · una innovación necesaria para la educación",
  con el fondo rosa hecho transparente.
- `tecnokids.png` — el globo Tecnokids, recortado ajustado (sin espacio sobrante).

## Rutas

- `/` pasa a ser la **portada** (lo primero que se ve).
- La pantalla de selección de avatares actual se mueve a `/inicio`.
- Botón **"Entrar"** en la portada → `/inicio`.
- Los 4 enlaces internos "← Inicio" / "Volver" (en `app/proyecto/page.tsx` ×2,
  `app/nino/[id]/page.tsx`, `app/lider/page.tsx`) pasan a apuntar a `/inicio`.

## Portada `/` (estilo Tailwind existente: degradado verde/cielo, tarjetas redondeadas)

1. Fila de logos institucionales: **Boyacá TIC** + **Go Escuela** con el renglón
   "una innovación necesaria para la educación".
2. Logo **Tecnokids** grande, centrado.
3. Título del proyecto: **"Con Ruralab: reciclando, al planeta vamos cuidando"**.
4. Sede José Joaquín Castro Martínez · Vereda Bosigas Norte · Sotaquirá (Boyacá).
5. **Docente:** María Inés Alfonso · **Líder:** Erika Barrera.
6. **Estudiantes:** María José · Luis Alejandro · Thiago Joel · Jerónimo · Damián.
7. **Desarrollado por:** Carlos Castellanos.
8. Botón "Entrar 🌍" → `/inicio`; enlaces secundarios a "Sobre el proyecto"
   (`/proyecto`) y "Cómo se hizo" (`/como-se-hizo`).

## Página `/como-se-hizo`

Explicación clara para la profe (en español sencillo):

- La app se construyó con **IA — Claude Code, de Anthropic**, guiada por una persona.
- Stack: Next.js + React, Tailwind CSS, base de datos SQLite.
- Proceso: idea → diseño (brainstorming con la IA) → implementación guiada por IA →
  pruebas → despliegue en Railway.
- Qué aporta la IA (escribe el código, propone diseños, explica) y qué decide la
  persona (qué construir, revisar, aprobar).
- Enlace de vuelta a la portada.

## Fuera de alcance

- Sin cambios en la base de datos ni en el PIN del líder (sigue `1234`).
