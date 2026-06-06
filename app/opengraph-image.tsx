import { ImageResponse } from "next/og";

// Imagen de previsualización (Open Graph) para WhatsApp, redes y buscadores.
export const alt = "Guardianes del Medio Ambiente";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const globe = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#047857"/>
  <circle cx="32" cy="32" r="20" fill="#7dd3fc"/>
  <path d="M14 33c3-1 5 2 8 1s4-4 7-3 3 6 0 8-8 3-12 1-5-5-3-8z" fill="#16a34a"/>
  <path d="M33 14c4-1 9 1 10 5 1 3-2 5-5 4s-7-2-7-5c0-2 1-3 2-4z" fill="#16a34a"/>
  <path d="M40 36c3-2 7 0 7 4 0 3-3 6-6 5s-4-3-4-6c0-1 1-2 3-3z" fill="#16a34a"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#ecfeff" stroke-width="2" opacity="0.6"/>
</svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ecfdf5 0%, #bae6fd 100%)",
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={240}
          height={240}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(globe)}`}
          alt=""
        />
        <div
          style={{
            marginTop: 36,
            fontSize: 70,
            fontWeight: 800,
            color: "#064e3b",
            textAlign: "center",
          }}
        >
          Guardianes del Medio Ambiente
        </div>
        <div style={{ marginTop: 14, fontSize: 34, color: "#047857" }}>
          Reciclando al planeta vamos cuidando
        </div>
      </div>
    ),
    { ...size }
  );
}
