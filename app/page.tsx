import Link from "next/link";

export const dynamic = "force-dynamic";

const ESTUDIANTES = [
  "María José",
  "Luis Alejandro",
  "Thiago Joel",
  "Jerónimo",
  "Damián",
];

export default function Portada() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Logos institucionales */}
      <section className="flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/boyaca-tic.png"
            alt="Gobernación de Boyacá"
            className="h-24 w-auto object-contain"
          />
          <span className="mt-1 text-sm font-bold tracking-[0.3em] text-emerald-900">
            TIC
          </span>
        </div>
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/go-escuela.png"
            alt="Go Escuela"
            className="h-24 w-auto object-contain"
          />
          <span className="mt-1 max-w-[14rem] text-center text-xs font-semibold text-emerald-700">
            Una innovación necesaria para la educación
          </span>
        </div>
      </section>

      {/* Logo del equipo */}
      <section className="mt-8 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/tecnokids.png"
          alt="Tecnokids"
          className="h-48 w-48 rounded-full object-contain shadow-lg ring-2 ring-emerald-200"
        />
        <p className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-900">
          Tecnokids
        </p>
        <p className="mt-1 text-center text-lg font-bold text-emerald-800">
          José Joaquín Castro Martínez
        </p>
        <p className="text-center text-sm text-emerald-700">
          Vereda Bosigas Norte · Sotaquirá (Boyacá)
        </p>
      </section>

      {/* Título del proyecto */}
      <section className="mt-8 rounded-3xl bg-white p-6 text-center shadow">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
          Con Ruralab
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-emerald-900">
          Reciclando, al planeta vamos cuidando
        </h1>
        <div className="text-5xl">🌍♻️</div>
      </section>

      {/* Equipo */}
      <section className="mt-6 space-y-4 rounded-3xl bg-white/70 p-6 shadow">
        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Docente
            </p>
            <p className="font-bold text-emerald-900">María Inés Alfonso</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Líder
            </p>
            <p className="font-bold text-emerald-900">Erika Barrera</p>
            <p className="text-sm text-emerald-600">Sotaquirá</p>
          </div>
        </div>

        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Estudiantes
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {ESTUDIANTES.map((nombre) => (
              <li
                key={nombre}
                className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm"
              >
                {nombre}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-sm text-emerald-700">
          Desarrollado por <b>Carlos Castellanos</b>
        </p>
      </section>

      {/* Acciones */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/inicio"
          className="inline-block rounded-full bg-emerald-700 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-emerald-800"
        >
          Entrar 🌍
        </Link>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/proyecto"
            className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
          >
            Sobre el proyecto 📖
          </Link>
          <Link
            href="/como-se-hizo"
            className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
          >
            ¿Cómo se hizo? 🤖
          </Link>
        </div>
      </div>
    </main>
  );
}
