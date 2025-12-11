import './globals.css';
import type { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';

const spartan = League_Spartan({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-spartan',
});

export const metadata: Metadata = {
  title: 'Hitchyard - The New Standard in Logistics',
  description: 'The standard has arrived. Secure your verified access now.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spartan.variable}>
      <body className="font-spartan min-h-screen antialiased flex flex-col items-center justify-center">
        {children}
      </body>
    </html>
  );
}
