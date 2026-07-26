import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finnext",
  description: "Controle financeiro pessoal com Next.js, Supabase e Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
