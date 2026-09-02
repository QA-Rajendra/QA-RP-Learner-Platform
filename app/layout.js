import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import ClientOnly from '@/components/common/ClientOnly';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'QA RP Learner Platform',
  description: 'Enterprise QA Automation & E-Learning Platform by QA RP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('qarp_theme')||'electric-dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ClientOnly fallback={<div className="h-16 w-full border-b" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-color)' }} />}>
            <Navbar />
          </ClientOnly>
          <main className="min-h-screen transition-colors duration-200" suppressHydrationWarning>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}