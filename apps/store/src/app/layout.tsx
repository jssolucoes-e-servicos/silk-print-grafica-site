import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silk Print Gráfica & Brindes | Cartões, Banners, Panfletos e Comunicação Visual',
  description: 'Gráfica online para revendedores e empresas. Alta definição, tiragens rápidas, entrega expressa e balcões de retirada em todo o Brasil.',
  openGraph: {
    title: 'Silk Print Gráfica & Brindes',
    description: 'Alta definição, grandes tiragens e entrega rápida em balcões de retirada.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
