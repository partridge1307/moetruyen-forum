import Navbar from '@/components/Nav/Navbar';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
  title: {
    default: 'Moetruyen Forum',
    template: '%s | Moetruyen Forum',
  },
  description:
    'Diễn đàn của web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia thảo luận tại Moetruyen Forum',
  colorScheme: 'dark light',
  themeColor: 'dark light',
  referrer: 'origin-when-cross-origin',
  generator: 'Moetruyen Forum',
  authors: [{ name: 'Moetruyen' }],
  keywords: ['Manga', 'Truyện tranh', 'Forum', 'Diễn đàn', 'Moetruyen'],
  openGraph: {
    title: 'Moetruyen Forum',
    description:
      'Diễn đàn của web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia thảo luận tại Moetruyen Forum',
    siteName: 'Moetruyen Forum',
    url: `${process.env.NEXTAUTH_URL}`,
    locale: 'vi',
    type: 'website',
  },
  twitter: {
    site: 'Moetruyen Forum',
    title: 'Moetruyen Forum',
    description:
      'Diễn đàn của web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia thảo luận tại Moetruyen Forum',
  },
  robots: {
    notranslate: true,
  },
};

const roboto = Roboto({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--font-roboto',
  preload: true,
  display: 'swap',
  adjustFontFallback: true,
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`dark ${roboto.variable} font-sans`}>
      <body className="antialiased dark:bg-zinc-800 md:scrollbar md:scrollbar--dark">
        <Providers>
          <Navbar />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
