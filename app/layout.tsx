import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="en">
      <body className="font-spartan antialiased">
        {children}
      </body>
    </html>
  );
}
