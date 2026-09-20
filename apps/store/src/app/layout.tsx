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
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
