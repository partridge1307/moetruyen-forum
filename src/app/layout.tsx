import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Sidebar/Header'), {
  ssr: false,
  loading: () => (
    <div className="absolute z-[9999] inset-0 flex items-center justify-center bg-background">
      <p className="text-3xl">Meow...</p>
    </div>
  ),
});

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F5F9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
  title: {
    default: 'Moetruyen Forum',
    template: '%s | Moetruyen Forum',
  },
  description:
    'Diễn đàn của web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia thảo luận tại Moetruyen Forum',
  referrer: 'strict-origin-when-cross-origin',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      translate="no"
      className={`dark ${roboto.variable} font-sans`}
    >
      <body className="flex flex-col md:flex-row antialiased bg-muted hide_scrollbar">
        <Providers>
          <Header />
          <main className="relative flex-1 flex md:pl60">{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
