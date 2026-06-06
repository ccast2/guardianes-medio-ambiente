import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guardianes del Medio Ambiente",
  description: "Reciclando al planeta vamos cuidando 🌍",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-emerald-50 to-sky-100 text-emerald-950 antialiased">
        {children}
      </body>
    </html>
  );
}
