import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ComoSeHizoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-emerald-700">
        ← Portada
      </Link>

      <header className="mt-4 text-center">
        <div className="text-5xl">🤖🌍</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          ¿Cómo se hizo esta app?
        </h1>
        <p className="mt-1 text-emerald-700">
          Construida con inteligencia artificial, guiada por una persona.
        </p>
      </header>

      <section className="mt-8 space-y-5 rounded-3xl bg-white/70 p-6 shadow">
        <div>
          <h2 className="text-xl font-bold">🤖 ¿Quién la programó?</h2>
          <p className="mt-1 text-emerald-900">
            La aplicación fue desarrollada con la ayuda de una{" "}
            <b>inteligencia artificial (IA)</b> llamada{" "}
            <b>Claude Code</b>, de la empresa Anthropic. La IA escribe el código
            de programación a partir de instrucciones en español, pero siempre
            guiada y revisada por una persona —en este caso, Carlos Castellanos—
            que decide qué construir y aprueba cada paso.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold">🧰 ¿Con qué está hecha?</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-2">
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">⚛️</div>
              Next.js y React
              <p className="text-xs text-emerald-600">la base de la página web</p>
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🎨</div>
              Tailwind CSS
              <p className="text-xs text-emerald-600">los colores y el diseño</p>
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🗄️</div>
              SQLite
              <p className="text-xs text-emerald-600">
                guarda los niños y los sellos
              </p>
            </li>
            <li className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <div className="text-2xl">🚀</div>
              Railway
              <p className="text-xs text-emerald-600">
                publica la app en internet
              </p>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">🪜 ¿Cómo se construyó, paso a paso?</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-emerald-900">
            <li>
              <b>La idea.</b> Partimos del proyecto de reciclaje de la escuela:
              que los niños marquen qué recipientes están llenos y la profe
              agende la recogida.
            </li>
            <li>
              <b>El diseño.</b> Conversando con la IA se decidió cómo se vería y
              qué pantallas tendría (niños, docente, proyecto, portada).
            </li>
            <li>
              <b>La programación.</b> La IA escribió el código de cada pantalla,
              siguiendo las instrucciones y corrigiendo lo que se pedía.
            </li>
            <li>
              <b>Las pruebas.</b> Se revisó que todo funcionara (marcar
              recipientes, ganar sellos, entrar como docente con el PIN).
            </li>
            <li>
              <b>La publicación.</b> Se subió a internet para que cualquiera
              pueda abrirla desde el celular o el computador.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-bold">⚖️ ¿Qué hace la IA y qué la persona?</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-bold">🤖 La IA</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-emerald-900">
                <li>Escribe el código.</li>
                <li>Propone diseños y textos.</li>
                <li>Explica y corrige errores.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-bold">🧑 La persona</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-emerald-900">
                <li>Decide qué construir.</li>
                <li>Revisa y aprueba cada parte.</li>
                <li>Da el contexto del proyecto y la escuela.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
        >
          Volver a la portada 🌍
        </Link>
      </div>
    </main>
  );
}
