import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capi da Sorte — O prêmio cresce com você",
  description: "Plataforma digital de sorteios online. Compre seus bilhetes, concorra a prêmios e acompanhe tudo em tempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}