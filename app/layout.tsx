import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elotesdelafuente.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ELOTES DE LA FUENTE",
  description:
    "Elotes, esquites y antojitos preparados con sabor tradicional y pedido en linea.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/isotipo-elotesdelafuente.svg",
  },
  openGraph: {
    title: "ELOTES DE LA FUENTE",
    description:
      "Tradicion, sabor y antojitos preparados en una tienda en linea con identidad propia.",
    url: siteUrl,
    siteName: "ELOTES DE LA FUENTE",
    images: ["/logo-elotesdelafuente.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
