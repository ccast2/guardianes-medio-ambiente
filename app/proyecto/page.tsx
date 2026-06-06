import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProyectoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-emerald-700">
        ← Inicio
      </Link>

      <header className="mt-4 text-center">
        <div className="text-5xl">🌍</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Reciclando al Planeta Vamos Cuidando
        </h1>
        <p className="mt-1 text-emerald-700">
          Proyecto ecológico y de sostenibilidad ambiental
        </p>
        <p className="text-sm text-emerald-600">
          Escuela José Joaquín Castro Martínez · Vereda Bosigas Norte, Sotaquirá
          (Boyacá) · Programa Tecnokids / Ruralab
        </p>
      </header>

      {/* Video */}
      <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow">
        <video
          controls
          preload="metadata"
          className="aspect-video w-full bg-black"
        >
          <source src="/proyecto/video.mp4" type="video/mp4" />
          Tu navegador no puede reproducir el video.
        </video>
        <p className="px-4 py-3 text-center text-sm text-emerald-700">
          🎥 Nuestros Guardianes del Medio Ambiente en acción
        </p>
      </section>

      {/* Profesora */}
      <section className="mt-8 rounded-3xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold">👩‍🏫 La profesora</h2>
        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/proyecto/maria-ines.png"
            alt="Profesora María Inés Alfonso"
            className="h-28 w-28 flex-none rounded-2xl object-cover object-[50%_25%] shadow ring-2 ring-emerald-200"
          />
          <div>
            <p className="text-lg font-bold">María Inés Alfonso</p>
            <p className="text-emerald-700">
              Profesora del colegio y de los niños, líder del proyecto y guía de
              los estudiantes en su camino como Guardianes del Medio Ambiente.
            </p>
          </div>
        </div>
      </section>

      {/* Sobre el proyecto */}
      <section className="mt-8 space-y-5 rounded-3xl bg-white/70 p-6 shadow">
        <div>
          <h2 className="text-xl font-bold">📌 ¿De qué se trata?</h2>
          <p className="mt-1 text-emerald-900">
            El proyecto nace de la problemática del vertimiento de basuras y
            residuos en el entorno escolar y las viviendas de la comunidad. A la
            escuela llegan muchas personas a usar las canchas de fútbol y
            baloncesto, y durante su estadía se arrojan botellas plásticas,
            botellas de vidrio, bolsas y residuos de comida. Esto evidencia la
            falta de conciencia ambiental y de recursos de depósito.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">🎯 Propósito</h2>
          <p className="mt-1 text-emerald-900">
            Estimular el reciclaje y generar hábitos que apoyen el cuidado del
            medio ambiente, la buena presentación de la escuela y el entorno de
            las familias.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">♻️ Nuestra solución</h2>
          <p className="mt-1 text-emerald-900">
            Diseñamos un <b>punto ecológico</b> para la escuela y para cada casa,
            que clasifica los residuos, junto con un <b>foso de compostaje</b>{" "}
            para los residuos orgánicos.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🟢</div>
              Vidrio
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🔵</div>
              Papel/Cartón
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🟡</div>
              Latas/Plástico
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🟤</div>
              Foso (orgánicos)
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">📚 Aporte teórico — Edgar Morin</h2>
          <p className="mt-1 text-emerald-900">
            El proyecto se inspira en el pensamiento de Edgar Morin, promoviendo
            una <b>cultura ecológica y de la sostenibilidad</b>, la{" "}
            <b>ética y responsabilidad ambiental</b>, y el desarrollo de
            habilidades para cuidar nuestro entorno.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">🤝 Con el apoyo de</h2>
          <p className="mt-1 text-emerald-900">
            Secretaría de Educación de Boyacá, los líderes de GO-ESCUELA y la
            líder de la vereda Erika Barrera. Participan cinco estudiantes de los
            grados 1° a 5°.
          </p>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
        >
          Volver al Inicio 🌍
        </Link>
      </div>
    </main>
  );
}
