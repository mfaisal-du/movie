import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '../styles/globals.css';
import 'video.js/dist/video-js.css';
import { Toaster } from 'react-hot-toast';
import Header from '../components/layout/Header';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'MovieCloud - Stream Your Favorite Movies',
  description: 'Premium movie streaming platform. Browse, search, and watch thousands of movies instantly.',
  keywords: ['movies', 'streaming', 'watch movies', 'online movies', 'movie cloud'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'MovieCloud - Stream Your Favorite Movies',
    description: 'Premium movie streaming platform. Browse, search, and watch thousands of movies instantly.',
    type: 'website',
    locale: 'en_US',
    siteName: 'MovieCloud',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} dark`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Righteous&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(26, 26, 62, 0.9)',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '12px 20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#0F0F23' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#0F0F23' } },
          }}
        />
      </body>
    </html>
  );
}