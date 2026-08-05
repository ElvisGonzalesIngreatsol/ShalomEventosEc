import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shalom Recepciones & Eventos | Salón de eventos sociales',
  description:
    'Shalom Recepciones & Eventos: un salón elegante para bodas, XV años, bautizos y eventos corporativos. Conoce nuestros servicios, revive tus eventos en fotos y contáctanos.',
  generator: 'v0.app',
  keywords: [
    'salón de eventos',
    'bodas',
    'XV años',
    'recepciones',
    'eventos sociales',
    'Shalom Recepciones',
  ],
  openGraph: {
    title: 'Shalom Recepciones & Eventos',
    description:
      'Un salón elegante para tus momentos más importantes. Bodas, XV años, bautizos y eventos corporativos.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
