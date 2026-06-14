import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'KickLink',
  description: 'Private pickup soccer organization platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
